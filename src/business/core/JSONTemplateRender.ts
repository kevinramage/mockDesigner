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

export class JSONTemplateRender implements JSONVisitor<string> {

    private _context : Context;

    constructor(context: Context)  {
        this._context = context;
    }

    visitJson (ctx: JsonContext): string {
        if (ctx.children) {
            let result = "";
            for( var key in ctx.children) {
                result += ctx.children[key].accept(this);
            }
            return result;
        } else {
            return "";
        }
    }

    visitValue(ctx: ValueContext) : string {
        if (ctx._object) {
            return ctx._object.accept(this);
        } else if (ctx._array) {
            return ctx._array.accept(this);
        } else if (ctx._exp) {
            return ctx._exp.accept(this);
        } else if (ctx._string) {
            return format("%s", ctx._string.text as string);
        } else if (ctx._number) {
            return ctx._number.text as string;
        } else if (ctx._true) {
            return ctx._true.text as string;
        } else if (ctx._false) {
            return ctx._false.text as string;
        } else if (ctx._null) {
            return ctx._null.text as string;
        } else {
            throw new Error("Method not implemented.");   
        }
    }

    visitObj (ctx: ObjContext) : string {
        let result = "{";
        if (ctx._pair1) {
            result += ctx._pair1.accept(this);
            if (ctx._pairRemaining) {
                for ( var key in ctx._pairRemaining) {
                    result += format(", %s", ctx._pairRemaining[key].accept(this));
                }
            }
        }
        result += "}";
        return result;
    }

    visitPair(ctx: PairContext) : string {
        let result = "";
        if (ctx._key && ctx._pairValue) {
            const value = ctx._pairValue.accept(this);
            result = format("%s : %s", ctx._key.text, value);
        }
        return result;
    }

    visitArr(ctx: ArrContext) : string {
        let result = "[";
        if (ctx._value1) {
            result += ctx._value1.accept(this);
            if (ctx._valueRemaining) {
                for (var key in ctx._valueRemaining) {
                    const value = ctx._valueRemaining[key].accept(this);
                    result += format(", %s", value);
                }
            }
        }
        result += "]";
        return result;
    }

    visitExpression(ctx: ExpressionContext) : string {
        if (ctx._id1) {
            let expression = format(".%s", ctx._id1.text);
            if (ctx._idRemaining) { 
                for (var key in ctx._idRemaining) {
                    expression += format(".%s", ctx._idRemaining[key].text);
                }
            }
            return this.evaluateExpression(expression, this.context);
        } else if (ctx._idData1) {
            const dataSource = ctx._idData1.text || "";
            let expression = "";
            for (var key in ctx._idDataRemaining) {
                expression += format("%s.", ctx._idDataRemaining[key].text);
            }
            if (expression.length > 0) {
                expression = expression.substr(0, expression.length - 1);
            }
            return this.evaluateDataSource(dataSource, expression, this.context);
        }
        return "";
    }

    evaluateExpression(variableName: string, context: Context) {
        const value = context.variables[variableName] || null;
        return this.evaluateVariale(value);
    }

    evaluateDataSource(dataSource: string, expression: string, context: Context) {
        const value = context.evaluateDataSource(dataSource, expression);
        return this.evaluateVariale(value);
    }

    evaluateVariale(value: any) {
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

    visit(tree: ParseTree): string {
        return tree.accept(this);
    }
    visitChildren(node: RuleNode): string {
        console.info("visitChildren");
        throw new Error("Method not implemented.");
    }
    visitTerminal(node: TerminalNode): string {
        console.info("visitTerminal");
        throw new Error("Method not implemented.");
    }
    visitErrorNode(node: ErrorNode): string {
        console.info("visitErrorNode");
        throw new Error("Method not implemented.");
    }

    public render(input: string) {
        let inputStream = CharStreams.fromString(input);
        let lexer = new JSONLexer(inputStream);
        let tokenStream = new CommonTokenStream(lexer);
        let parser = new JSONParser(tokenStream);
        let tree = parser.json();
        let result = this.visit(tree);
        return JSON.stringify(JSON.parse(result));
    }

    public get context() {
        return this._context;
    }
}