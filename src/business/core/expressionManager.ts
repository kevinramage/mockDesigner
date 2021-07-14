import { format } from "util";
import { OPERATION } from "../utils/enum";
import { Condition } from "./condition";
import { Context } from "./context";
import * as winston from "winston";

export class ExpressionManager {
    private static _instance : ExpressionManager;

    public evaluateExpression(context: Context, expression: string) {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const regex = /\"\s*{{\s*([a-zA-Z0-9|\.|$|_|{|}|(|)|,]|(\\\"))+\s*}}\s*\"/g;
                const match = regex.exec(expression);
                if (match) {
                    const contentToEvaluate = match[0].replace(/\\\"/g, "\"");
                    let evaluation = await this.evaluateLimitedExpression(context, contentToEvaluate);
                    evaluation = this.expressionToString(evaluation);
                    const newInput = expression.replace(match[0], evaluation);
                    resolve(this.evaluateExpression(context, newInput));
                } else {
                    resolve(expression);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    private evaluateLimitedExpression(context: Context, expression: string) : Promise<any> {
        return new Promise<string>(async (resolve, reject) => {
            const startIndex = expression.indexOf("{{") + 2;
            const endIndex = expression.lastIndexOf("}}");
            let expressionComputed = expression.substr(startIndex, endIndex - startIndex).trim();

            // Computed expression inside
            try {
                expressionComputed = await this.evaluateExpression(context, expressionComputed);
                if (expressionComputed) {
                    expressionComputed = expressionComputed.trim();
                } else {
                    resolve(expressionComputed);
                }
            } catch (err) {
                reject(err);
            }

            // Request
            if (expressionComputed.startsWith(".request")) {
                resolve(context.variables[expressionComputed] || null);

            // Data
            } else if (expressionComputed.startsWith(".data")) {
                let dataSourceName = "";
                let expression = "";
                const indexStartDataSource = expressionComputed.indexOf(".", (".data").length);
                if (indexStartDataSource > -1) {

                    // Identify data source and expression
                    const indexEndDataSource = expressionComputed.indexOf(".", indexStartDataSource+1);
                    if (indexEndDataSource > -1) {
                        dataSourceName = expressionComputed.substr(indexStartDataSource+1, indexEndDataSource - indexStartDataSource -1);
                        expression = expressionComputed.substr(indexEndDataSource+1);
                    } else {
                        dataSourceName = expressionComputed.substr(indexStartDataSource+1);
                    }

                    // Evaluate data source
                    const evaluation = this.evaluateDataSource(dataSourceName, expression, context);
                    resolve(evaluation);
                
                } else {
                    reject(new Error("Invalid data source expression: " + expressionComputed));
                }
                resolve("");

            // Storage
            } else if (expressionComputed.startsWith(".store")) {
                ///TODO
                resolve("");

            // Function
            } else if (!expressionComputed.startsWith(".")) {
                const leftParenthesisIndex = expressionComputed.indexOf("(");
                const rightParenthesisIndex = expressionComputed.indexOf(")");
            
                if (leftParenthesisIndex > -1 && rightParenthesisIndex > leftParenthesisIndex) {
                    const functionName = expressionComputed.substr(0, leftParenthesisIndex);
                    const argText = expressionComputed.substr(leftParenthesisIndex+1, (rightParenthesisIndex - leftParenthesisIndex-1));
                    const args = argText.split(",");

                    try {
                        const evaluation = await this.evaluateFunction(functionName, args, context);
                        resolve(evaluation as string);

                    } catch (err) {
                        reject(err);
                    }
                } else {
                    reject(new Error("Invalid function: " + expressionComputed));
                }

            // Invalid expression
            } else {
                reject(new Error("Invalid expression: " + expressionComputed));
            }
        });
    }

    public evaluateVariableExpression(variableName: string, context: Context) {
        const value = context.variables[variableName] || null;
        return this.expressionToString(value);
    }

    public evaluateDataSource(dataSource: string, expression: string, context: Context) {
        try {
            const value = context.evaluateDataSource(dataSource, expression);
            return this.expressionToString(value);

        } catch (err) {
            winston.error("ExpressionManager.evaluateDataSource: An error occured during data source evaluation", err);
            throw err;
        }
    }

    public evaluateFunction(functionName: string, expressions: string[], context: Context) {
        return new Promise<any>(async (resolve, reject) => {
            try {
                const value = await context.evaluateFunction(functionName, expressions);
                resolve(this.expressionToString(value));
            } catch (err) {
                reject(err);
            }
        });
    }

    public evaluateCondition(context: Context, condition: Condition) {
        return new Promise<boolean>(async (resolve, reject) => {
            let values : string[] = [];
            let regex : RegExp;
            const leftOp = await this.evaluateExpression(context, condition.left);
            const rightOp = await this.evaluateExpression(context, condition.right);
            switch (condition.operation) {
                case OPERATION.EQUALS:
                    resolve(leftOp == rightOp);
    
                case OPERATION.NOT_EQUALS:
                    resolve(leftOp != rightOp);
    
                case OPERATION.MATCHES:
                    regex = new RegExp(rightOp);
                    resolve(regex.exec(leftOp) !== null);
    
                case OPERATION.NOT_MATCHES:
                    regex = new RegExp(rightOp);
                    resolve(regex.exec(leftOp) !== null);
    
                case OPERATION.IN:
                    values = (rightOp as string).split(";");
                    resolve(values.includes(leftOp));
    
                case OPERATION.NOT_IN:
                    values = (rightOp as string).split(";");
                    resolve(!values.includes(leftOp));
    
                case OPERATION.RANGE:
                    values = (rightOp as string).split("...");
                    const actual = Number.parseInt((leftOp as string));
                    const min = Number.parseInt(values[0]);
                    const max = Number.parseInt(values[1]);
                    resolve(actual >= min && actual <= max);
    
                default:
                    reject(new Error("Invalid operation: " + condition.operation));
            }
        });
    }

    public expressionToString(value: any) {
        if (typeof value === "string") {
            const string = value as string;
            if (string.startsWith("\"") && string.endsWith("\"")) {
                return value;
            } else {
                return format("\"%s\"", value);
            }
        } else if (typeof value === "number" || typeof value === "boolean") {
            return value.toString();
        } else if (value === null) {
            return "null";
        } else {
            return "\"undefined\"";
        }
    }

    public static get instance() {
        if (!ExpressionManager._instance) {
            ExpressionManager._instance = new ExpressionManager();
        }
        return ExpressionManager._instance;
    }
}