import { Token } from "antlr4ts";
import { CharStreams, CommonTokenStream } from "antlr4ts";
import { ErrorNode } from "antlr4ts/tree/ErrorNode";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { RuleNode } from "antlr4ts/tree/RuleNode";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { format } from "util";
import { JSONLexer } from "../grammar/JSONLexer";
import { JsonContext, ObjContext, PairContext, ArrContext, ValueContext, JSONParser, ExpressionContext } from "../grammar/JSONParser";
import { JSONVisitor } from "../grammar/JSONVisitor";
import { Context } from "./context";

export class JSONTemplateRender implements JSONVisitor<Promise<string>> {

    private _context : Context;

    constructor(context: Context)  {
        this._context = context;
    }

    visitJson (ctx: JsonContext) {
        return new Promise<string>(async (resolve, reject) => {
            if (ctx.children) {
                let result = "";
                for( var key in ctx.children) {
                    result += await ctx.children[key].accept(this);
                }
                resolve(result);
            } else {
                reject(new Error("No children found on json tree"));
            }
        });
    }

    visitValue(ctx: ValueContext) {
        return new Promise<string>(async (resolve) => {
            if (ctx._object) {
                resolve(await ctx._object.accept(this));
            } else if (ctx._array) {
                resolve(await ctx._array.accept(this));
            } else if (ctx._exp) {
                resolve(await ctx._exp.accept(this));
            } else if (ctx._string) {
                resolve(format("%s", ctx._string.text as string));
            } else if (ctx._number) {
                resolve(ctx._number.text as string);
            } else if (ctx._true) {
                resolve(ctx._true.text as string);
            } else if (ctx._false) {
                resolve(ctx._false.text as string);
            } else if (ctx._null) {
                resolve(ctx._null.text as string);
            } else {
                throw new Error("Invalid context, a value must be defined");   
            }
        });
    }

    visitObj (ctx: ObjContext) {
        return new Promise<string>(async (resolve) => {
            let result = "{";
            if (ctx._pair1) {
                result += await ctx._pair1.accept(this);
                if (ctx._pairRemaining) {
                    for ( var key in ctx._pairRemaining) {
                        result += format(", %s", await ctx._pairRemaining[key].accept(this));
                    }
                }
            }
            result += "}";
            resolve(result);
        });
    }

    visitPair(ctx: PairContext) {
        return new Promise<string>(async (resolve) => {
            let result = "";
            if (ctx._key && ctx._pairValue) {
                const value = await ctx._pairValue.accept(this);
                result = format("%s : %s", ctx._key.text, value);
            }
            resolve(result);
        })
    }

    visitArr(ctx: ArrContext) {
        return new Promise<string>(async (resolve) => {
            let result = "[";
            if (ctx._value1) {
                result += await ctx._value1.accept(this);
                if (ctx._valueRemaining) {
                    for (var key in ctx._valueRemaining) {
                        const value = await ctx._valueRemaining[key].accept(this);
                        result += format(", %s", value);
                    }
                }
            }
            result += "]";
            resolve(result);
        });
    }

    visitExpression(ctx: ExpressionContext) {
        return new Promise<string>(async(resolve) => {
            // Expression
            if (ctx._id1) {
                const evaluation = this.visitClassicalExpression(ctx._id1, ctx._idRemaining);
                resolve(evaluation);

            // Data source
            } else if (ctx._idData1) {
                const evaluation = this.visitDataSourceExpression(ctx._idData1, ctx._idDataRemaining);
                resolve(evaluation);

            } else if (ctx._idClass) {
                const evalation = await this.visitFunctionExpression(ctx._idClass, ctx._idFunc, ctx._arg, ctx._argRemaining);
                resolve(evalation);
            }
        });
    }

    visitClassicalExpression(id: Token, idRemaining: Token[]) {
        let expression = format(".%s", id.text);
        if (idRemaining) { 
            for (var key in idRemaining) {
                expression += format(".%s", idRemaining[key].text);
            }
        }
        return this.evaluateExpression(expression, this.context);
    }

    visitDataSourceExpression(id: Token, idRemaining: Token[]) {
        const dataSource = id.text || "";
        let expression = "";
        for (var key in idRemaining) {
            expression += format("%s.", idRemaining[key].text);
        }
        if (expression.length > 0) {
            expression = expression.substr(0, expression.length - 1);
        }
        return this.evaluateDataSource(dataSource, expression, this.context);
    } 

    visitFunctionExpression(idClass: Token, idFunc?: Token, arg ?: ValueContext, argRemaining ?: ValueContext[]) {
        return new Promise<string>(async (resolve) => {
            let functionName = idClass.text || "";
            if (idFunc) {
                functionName += "." + idFunc.text;
            }
            let expressions : string[] = [];
            if (arg) {
                let argumentEvaluated = await this.visitValue(arg);
                expressions.push(argumentEvaluated);
                if (argRemaining) {
                    for (var key in argRemaining) {
                        argumentEvaluated = await this.visitValue(argRemaining[key]); 
                        expressions.push(argumentEvaluated);
                    }
                }
            }
            const result = await this.evaluateFunction(functionName, expressions, this.context);
            resolve(result);
        });
        
    }

    evaluateExpression(variableName: string, context: Context) {
        const value = context.variables[variableName] || null;
        return this.evaluateVariable(value);
    }

    evaluateDataSource(dataSource: string, expression: string, context: Context) {
        const value = context.evaluateDataSource(dataSource, expression);
        return this.evaluateVariable(value);
    }

    async evaluateFunction(functionName: string, expressions: string[], context: Context) {
        return new Promise<string>(async (resolve) => {
            const value = await context.evaluateFunction(functionName, expressions);
            resolve(this.evaluateVariable(value));
        });

    }

    evaluateVariable(value: any) {
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

    async visit(tree: ParseTree) {
        return await tree.accept(this);
    }
    visitChildren(node: RuleNode): Promise<string> {
        throw new Error("Method not implemented.");
    }
    visitTerminal(node: TerminalNode): Promise<string> {
        throw new Error("Method not implemented.");
    }
    visitErrorNode(node: ErrorNode): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public render(input: string) {
        return new Promise<string>(async (resolve, reject) => {
            let inputStream = CharStreams.fromString(input);
            let lexer = new JSONLexer(inputStream);
            let tokenStream = new CommonTokenStream(lexer);
            let parser = new JSONParser(tokenStream);
            const tree = parser.json();
            const result = await this.visit(tree);
            try {
                const resultPrettyPrint = JSON.stringify(JSON.parse(result));
                resolve(resultPrettyPrint);
            } catch (err) {
                reject(err);
            }
        });
    }

    public get context() {
        return this._context;
    }
}