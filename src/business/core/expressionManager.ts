import { format } from "util";
import { OPERATION } from "../utils/enum";
import { Condition } from "./condition";
import { Context } from "./context";

export class ExpressionManager {
    private static _instance : ExpressionManager;

    public evaluateExpression(context: Context, expression: string) : string{
        if (expression.startsWith("{{") && expression.endsWith("}}")) {
            const expressionComputed = expression.substr(2, expression.length - 4);
            
            // Data

            // Storage

            // Function

            // Expression

            return context.variables[expressionComputed] || null;
        } else {
            return expression;
        }
    }

    public evaluateVariableExpression(variableName: string, context: Context) {
        const value = context.variables[variableName] || null;
        return this.expressionToString(value);
    }

    public evaluateDataSource(dataSource: string, expression: string, context: Context) {
        const value = context.evaluateDataSource(dataSource, expression);
        return this.expressionToString(value);
    }

    public evaluateFunction(functionName: string, expressions: string[], context: Context) {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const value = await context.evaluateFunction(functionName, expressions);
                resolve(this.expressionToString(value));
            } catch (err) {
                reject(err);
            }
        });
    }

    public evaluateCondition(context: Context, condition: Condition) : boolean {
        let values : string[] = [];
        let regex : RegExp;
        const leftOp = this.evaluateExpression(context, condition.left);
        const rightOp = this.evaluateExpression(context, condition.right);
        switch (condition.operation) {
            case OPERATION.EQUALS:
                return leftOp == rightOp;

            case OPERATION.NOT_EQUALS:
                return leftOp != rightOp;

            case OPERATION.MATCHES:
                regex = new RegExp(rightOp);
                return regex.exec(leftOp) !== null;

            case OPERATION.NOT_MATCHES:
                regex = new RegExp(rightOp);
                return regex.exec(leftOp) !== null;

            case OPERATION.IN:
                values = (rightOp as string).split(";");
                return values.includes(leftOp);

            case OPERATION.NOT_IN:
                values = (rightOp as string).split(";");
                return !values.includes(leftOp);

            case OPERATION.RANGE:
                values = (rightOp as string).split("...");
                const actual = Number.parseInt((leftOp as string));
                const min = Number.parseInt(values[0]);
                const max = Number.parseInt(values[1]);
                return actual >= min && actual <= max;

            default:
                throw new Error("Invalid operation: " + condition.operation)
        }
    }

    public expressionToString(value: any) {
        if (typeof value === "string") {
            return format("\"%s\"", value);
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