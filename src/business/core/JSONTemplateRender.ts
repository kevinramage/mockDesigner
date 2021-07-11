import { ANTLRErrorListener, RecognitionException, Recognizer, Token } from "antlr4ts";
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
import { ExpressionManager } from "./expressionManager";
import { StorageManager } from "./storageManager";

import * as winston from "winston";

export class JSONTemplateRender implements JSONVisitor<Promise<string>> {

    private _context : Context;
    private _error ?: Error;

    constructor(context: Context)  {
        this._context = context;
    }

    visitJson (ctx: JsonContext) {
        return new Promise<string>(async (resolve) => {
            if (ctx.children) {
                let result = "";
                for( var key in ctx.children) {
                    result += await ctx.children[key].accept(this);
                }
                resolve(result);
            } else {
                this._error = new Error("No children found on json tree");
                resolve("");
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
                this._error = new Error("Invalid context, a value must be defined");
                resolve(""); 
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

            // Storage
            } else if (ctx._idKey) {
                try {
                    const evaluation = await this.visitStorage(ctx._idKey, ctx._exp1 as Token);
                    resolve(evaluation);
                } catch (err) {
                    this._error = err;
                    resolve("");
                }

            // Data source
            } else if (ctx._idData1) {
                const evaluation = this.visitDataSourceExpression(ctx._idData1, ctx._idDataRemaining);
                resolve(evaluation);

            // Function
            } else if (ctx._idClass) {
                const evaluation = await this.visitFunctionExpression(ctx._idClass, ctx._idFunc, ctx._arg, ctx._argRemaining);
                resolve(evaluation);
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
        return ExpressionManager.instance.evaluateVariableExpression(expression, this.context);
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
        return ExpressionManager.instance.evaluateDataSource(dataSource, expression, this.context);
    } 

    visitFunctionExpression(idClass: Token, idFunc?: Token, arg ?: ValueContext, argRemaining ?: ValueContext[]) {
        return new Promise<string>(async (resolve) => {
            try {
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
                const result = await ExpressionManager.instance.evaluateFunction(functionName, expressions, this.context);
                resolve(result);

            } catch (err) {
                this._error = err;
                resolve("");
            }
        });
        
    }

    visitStorage(storageKey: Token, member: Token) {
        return StorageManager.instance.getValue(storageKey.text as string, member.text as string);
    }

    async visit(tree: ParseTree) {
        return await tree.accept(this);
    }
    visitChildren(node: RuleNode): Promise<string> {
        return new Promise<string>((resolve) => {
            this._error = new Error("Method not implemented.");
            resolve("");
        });
    }
    visitTerminal(node: TerminalNode): Promise<string> {
        return new Promise<string>((resolve) => {
            this._error = new Error("Method not implemented.");
            resolve("");
        });
    }
    visitErrorNode(node: ErrorNode): Promise<string> {
        return new Promise<string>((resolve) => {
            this._error = new Error("Method not implemented.");
            resolve("");
        });
    }

    public render(input: string) {
        return new Promise<string>(async (resolve, reject) => {
            try {
                // Lexer
                const lexerError = new LexerError();
                const inputStream = CharStreams.fromString(input);
                const lexer = new JSONLexer(inputStream);
                lexer.removeErrorListeners();
                lexer.addErrorListener(lexerError);

                // Parser
                const tokenError = new ParserError();
                const tokenStream = new CommonTokenStream(lexer);
                const parser = new JSONParser(tokenStream);
                parser.removeErrorListeners();
                parser.addErrorListener(tokenError);
                const tree = parser.json();

                if (!lexerError.isInError && !tokenError.isInError) {

                    // Visit
                    const result = await this.visit(tree);
                    
                    if ( !this._error) {

                        // Pretty print result
                        const resultPrettyPrint = JSON.stringify(JSON.parse(result));
                        resolve(resultPrettyPrint);

                    } else {
                        winston.error("JSONTemplateRender - Parsing error ", this._error);
                        reject(this._error);
                    }

                } else if (lexerError.isInError) {
                    const error = new Error(lexerError.errors.join(", "));
                    winston.error("JSONTemplateRender - Parsing error ", error);
                    reject(error);
                } else {
                    const error = new Error(tokenError.errors.join(", "));
                    winston.error("JSONTemplateRender - Parsing error ", error);
                    reject(error);
                }
            } catch (err) {
                winston.error("JSONTemplateRender - Parsing error ", err);
                reject(err);
            }
        });
    }

    public get context() {
        return this._context;
    }
}

class LexerError implements ANTLRErrorListener<number> {

    private _isInError : boolean;
    private _errors: string[];

    constructor() {
        this._isInError = false;
        this._errors = [];
    }

    public syntaxError(recognizer: Recognizer<number, any>, offendingSymbol: number | undefined, line: number, charPositionInLine: number, msg: string, e: RecognitionException | undefined) {
        const error = format("line %d:%d %s", line, charPositionInLine, msg);
        this._errors.push(error);
        this._isInError = true;
    }

    public get isInError() {
        return this._isInError;
    }

    public get errors() {
        return this._errors;
    }
}

class ParserError implements ANTLRErrorListener<Token> {

    private _isInError : boolean;
    private _errors : string[];

    constructor() {
        this._isInError = false;
        this._errors = [];
    }

    public syntaxError(recognizer: Recognizer<Token, any>, offendingSymbol: Token | undefined, line: number, charPositionInLine: number, msg: string, e: RecognitionException | undefined) {
        const error = format("line %d:%d %s", line, charPositionInLine, msg);
        this._errors.push(error);
        this._isInError = true;
    }

    public get isInError() {
        return this._isInError;
    }

    public get errors() {
        return this._errors;
    }
}