// Generated from business/grammar/JSON.g4 by ANTLR 4.6-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { JSONListener } from "./JSONListener";
import { JSONVisitor } from "./JSONVisitor";


export class JSONParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly T__5 = 6;
	public static readonly T__6 = 7;
	public static readonly T__7 = 8;
	public static readonly T__8 = 9;
	public static readonly DOT = 10;
	public static readonly OPEN_EXP = 11;
	public static readonly CLOSE_EXP = 12;
	public static readonly NUMBER = 13;
	public static readonly IDENT = 14;
	public static readonly STRING = 15;
	public static readonly WS = 16;
	public static readonly RULE_json = 0;
	public static readonly RULE_obj = 1;
	public static readonly RULE_pair = 2;
	public static readonly RULE_arr = 3;
	public static readonly RULE_expression = 4;
	public static readonly RULE_value = 5;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"json", "obj", "pair", "arr", "expression", "value",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'{'", "','", "'}'", "':'", "'['", "']'", "'true'", "'false'", 
		"'null'", "'.'", "'{{'", "'}}'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, "DOT", "OPEN_EXP", "CLOSE_EXP", "NUMBER", 
		"IDENT", "STRING", "WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(JSONParser._LITERAL_NAMES, JSONParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return JSONParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "JSON.g4"; }

	// @Override
	public get ruleNames(): string[] { return JSONParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return JSONParser._serializedATN; }

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(JSONParser._ATN, this);
	}
	// @RuleVersion(0)
	public json(): JsonContext {
		let _localctx: JsonContext = new JsonContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, JSONParser.RULE_json);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 12;
			this.value();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public obj(): ObjContext {
		let _localctx: ObjContext = new ObjContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, JSONParser.RULE_obj);
		let _la: number;
		try {
			this.state = 27;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 1, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 14;
				this.match(JSONParser.T__0);
				this.state = 15;
				_localctx._pair1 = this.pair();
				this.state = 20;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === JSONParser.T__1) {
					{
					{
					this.state = 16;
					this.match(JSONParser.T__1);
					this.state = 17;
					_localctx._pair = this.pair();
					_localctx._pairRemaining.push(_localctx._pair);
					}
					}
					this.state = 22;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 23;
				this.match(JSONParser.T__2);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 25;
				this.match(JSONParser.T__0);
				this.state = 26;
				this.match(JSONParser.T__2);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public pair(): PairContext {
		let _localctx: PairContext = new PairContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, JSONParser.RULE_pair);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 29;
			_localctx._key = this.match(JSONParser.STRING);
			this.state = 30;
			this.match(JSONParser.T__3);
			this.state = 31;
			_localctx._pairValue = this.value();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public arr(): ArrContext {
		let _localctx: ArrContext = new ArrContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, JSONParser.RULE_arr);
		let _la: number;
		try {
			this.state = 46;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 33;
				this.match(JSONParser.T__4);
				this.state = 34;
				_localctx._value1 = this.value();
				this.state = 39;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === JSONParser.T__1) {
					{
					{
					this.state = 35;
					this.match(JSONParser.T__1);
					this.state = 36;
					_localctx._value = this.value();
					_localctx._valueRemaining.push(_localctx._value);
					}
					}
					this.state = 41;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 42;
				this.match(JSONParser.T__5);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 44;
				this.match(JSONParser.T__4);
				this.state = 45;
				this.match(JSONParser.T__5);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public expression(): ExpressionContext {
		let _localctx: ExpressionContext = new ExpressionContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, JSONParser.RULE_expression);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 48;
			this.match(JSONParser.OPEN_EXP);
			this.state = 49;
			this.match(JSONParser.DOT);
			this.state = 50;
			_localctx._id1 = this.match(JSONParser.IDENT);
			this.state = 55;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === JSONParser.DOT) {
				{
				{
				this.state = 51;
				this.match(JSONParser.DOT);
				this.state = 52;
				_localctx._IDENT = this.match(JSONParser.IDENT);
				_localctx._idRemaining.push(_localctx._IDENT);
				}
				}
				this.state = 57;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 58;
			this.match(JSONParser.CLOSE_EXP);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public value(): ValueContext {
		let _localctx: ValueContext = new ValueContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, JSONParser.RULE_value);
		try {
			this.state = 68;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case JSONParser.STRING:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 60;
				_localctx._string = this.match(JSONParser.STRING);
				}
				break;
			case JSONParser.NUMBER:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 61;
				_localctx._number = this.match(JSONParser.NUMBER);
				}
				break;
			case JSONParser.OPEN_EXP:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 62;
				_localctx._exp = this.expression();
				}
				break;
			case JSONParser.T__0:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 63;
				_localctx._object = this.obj();
				}
				break;
			case JSONParser.T__4:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 64;
				_localctx._array = this.arr();
				}
				break;
			case JSONParser.T__6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 65;
				_localctx._true = this.match(JSONParser.T__6);
				}
				break;
			case JSONParser.T__7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 66;
				_localctx._false = this.match(JSONParser.T__7);
				}
				break;
			case JSONParser.T__8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 67;
				_localctx._null = this.match(JSONParser.T__8);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uAF6F\u8320\u479D\uB75C\u4880\u1605\u191C\uAB37\x03\x12I\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x07\x03\x15\n\x03" +
		"\f\x03\x0E\x03\x18\v\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03\x1E\n" +
		"\x03\x03\x04\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05\x07" +
		"\x05(\n\x05\f\x05\x0E\x05+\v\x05\x03\x05\x03\x05\x03\x05\x03\x05\x05\x05" +
		"1\n\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x068\n\x06\f\x06\x0E" +
		"\x06;\v\x06\x03\x06\x03\x06\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03" +
		"\x07\x03\x07\x03\x07\x05\x07G\n\x07\x03\x07\x02\x02\x02\b\x02\x02\x04" +
		"\x02\x06\x02\b\x02\n\x02\f\x02\x02\x02N\x02\x0E\x03\x02\x02\x02\x04\x1D" +
		"\x03\x02\x02\x02\x06\x1F\x03\x02\x02\x02\b0\x03\x02\x02\x02\n2\x03\x02" +
		"\x02\x02\fF\x03\x02\x02\x02\x0E\x0F\x05\f\x07\x02\x0F\x03\x03\x02\x02" +
		"\x02\x10\x11\x07\x03\x02\x02\x11\x16\x05\x06\x04\x02\x12\x13\x07\x04\x02" +
		"\x02\x13\x15\x05\x06\x04\x02\x14\x12\x03\x02\x02\x02\x15\x18\x03\x02\x02" +
		"\x02\x16\x14\x03\x02\x02\x02\x16\x17\x03\x02\x02\x02\x17\x19\x03\x02\x02" +
		"\x02\x18\x16\x03\x02\x02\x02\x19\x1A\x07\x05\x02\x02\x1A\x1E\x03\x02\x02" +
		"\x02\x1B\x1C\x07\x03\x02\x02\x1C\x1E\x07\x05\x02\x02\x1D\x10\x03\x02\x02" +
		"\x02\x1D\x1B\x03\x02\x02\x02\x1E\x05\x03\x02\x02\x02\x1F \x07\x11\x02" +
		"\x02 !\x07\x06\x02\x02!\"\x05\f\x07\x02\"\x07\x03\x02\x02\x02#$\x07\x07" +
		"\x02\x02$)\x05\f\x07\x02%&\x07\x04\x02\x02&(\x05\f\x07\x02\'%\x03\x02" +
		"\x02\x02(+\x03\x02\x02\x02)\'\x03\x02\x02\x02)*\x03\x02\x02\x02*,\x03" +
		"\x02\x02\x02+)\x03\x02\x02\x02,-\x07\b\x02\x02-1\x03\x02\x02\x02./\x07" +
		"\x07\x02\x02/1\x07\b\x02\x020#\x03\x02\x02\x020.\x03\x02\x02\x021\t\x03" +
		"\x02\x02\x0223\x07\r\x02\x0234\x07\f\x02\x0249\x07\x10\x02\x0256\x07\f" +
		"\x02\x0268\x07\x10\x02\x0275\x03\x02\x02\x028;\x03\x02\x02\x0297\x03\x02" +
		"\x02\x029:\x03\x02\x02\x02:<\x03\x02\x02\x02;9\x03\x02\x02\x02<=\x07\x0E" +
		"\x02\x02=\v\x03\x02\x02\x02>G\x07\x11\x02\x02?G\x07\x0F\x02\x02@G\x05" +
		"\n\x06\x02AG\x05\x04\x03\x02BG\x05\b\x05\x02CG\x07\t\x02\x02DG\x07\n\x02" +
		"\x02EG\x07\v\x02\x02F>\x03\x02\x02\x02F?\x03\x02\x02\x02F@\x03\x02\x02" +
		"\x02FA\x03\x02\x02\x02FB\x03\x02\x02\x02FC\x03\x02\x02\x02FD\x03\x02\x02" +
		"\x02FE\x03\x02\x02\x02G\r\x03\x02\x02\x02\b\x16\x1D)09F";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!JSONParser.__ATN) {
			JSONParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(JSONParser._serializedATN));
		}

		return JSONParser.__ATN;
	}

}

export class JsonContext extends ParserRuleContext {
	public value(): ValueContext {
		return this.getRuleContext(0, ValueContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return JSONParser.RULE_json; }
	// @Override
	public enterRule(listener: JSONListener): void {
		if (listener.enterJson) {
			listener.enterJson(this);
		}
	}
	// @Override
	public exitRule(listener: JSONListener): void {
		if (listener.exitJson) {
			listener.exitJson(this);
		}
	}
	// @Override
	public accept<Result>(visitor: JSONVisitor<Result>): Result {
		if (visitor.visitJson) {
			return visitor.visitJson(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ObjContext extends ParserRuleContext {
	public _pair1?: PairContext;
	public _pair?: PairContext;
	public _pairRemaining: PairContext[] = [];
	public pair(): PairContext[];
	public pair(i: number): PairContext;
	public pair(i?: number): PairContext | PairContext[] {
		if (i === undefined) {
			return this.getRuleContexts(PairContext);
		} else {
			return this.getRuleContext(i, PairContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return JSONParser.RULE_obj; }
	// @Override
	public enterRule(listener: JSONListener): void {
		if (listener.enterObj) {
			listener.enterObj(this);
		}
	}
	// @Override
	public exitRule(listener: JSONListener): void {
		if (listener.exitObj) {
			listener.exitObj(this);
		}
	}
	// @Override
	public accept<Result>(visitor: JSONVisitor<Result>): Result {
		if (visitor.visitObj) {
			return visitor.visitObj(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PairContext extends ParserRuleContext {
	public _key?: Token;
	public _pairValue?: ValueContext;
	public STRING(): TerminalNode { return this.getToken(JSONParser.STRING, 0); }
	public value(): ValueContext {
		return this.getRuleContext(0, ValueContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return JSONParser.RULE_pair; }
	// @Override
	public enterRule(listener: JSONListener): void {
		if (listener.enterPair) {
			listener.enterPair(this);
		}
	}
	// @Override
	public exitRule(listener: JSONListener): void {
		if (listener.exitPair) {
			listener.exitPair(this);
		}
	}
	// @Override
	public accept<Result>(visitor: JSONVisitor<Result>): Result {
		if (visitor.visitPair) {
			return visitor.visitPair(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ArrContext extends ParserRuleContext {
	public _value1?: ValueContext;
	public _value?: ValueContext;
	public _valueRemaining: ValueContext[] = [];
	public value(): ValueContext[];
	public value(i: number): ValueContext;
	public value(i?: number): ValueContext | ValueContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ValueContext);
		} else {
			return this.getRuleContext(i, ValueContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return JSONParser.RULE_arr; }
	// @Override
	public enterRule(listener: JSONListener): void {
		if (listener.enterArr) {
			listener.enterArr(this);
		}
	}
	// @Override
	public exitRule(listener: JSONListener): void {
		if (listener.exitArr) {
			listener.exitArr(this);
		}
	}
	// @Override
	public accept<Result>(visitor: JSONVisitor<Result>): Result {
		if (visitor.visitArr) {
			return visitor.visitArr(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	public _id1?: Token;
	public _IDENT?: Token;
	public _idRemaining: Token[] = [];
	public OPEN_EXP(): TerminalNode { return this.getToken(JSONParser.OPEN_EXP, 0); }
	public DOT(): TerminalNode[];
	public DOT(i: number): TerminalNode;
	public DOT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(JSONParser.DOT);
		} else {
			return this.getToken(JSONParser.DOT, i);
		}
	}
	public CLOSE_EXP(): TerminalNode { return this.getToken(JSONParser.CLOSE_EXP, 0); }
	public IDENT(): TerminalNode[];
	public IDENT(i: number): TerminalNode;
	public IDENT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(JSONParser.IDENT);
		} else {
			return this.getToken(JSONParser.IDENT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return JSONParser.RULE_expression; }
	// @Override
	public enterRule(listener: JSONListener): void {
		if (listener.enterExpression) {
			listener.enterExpression(this);
		}
	}
	// @Override
	public exitRule(listener: JSONListener): void {
		if (listener.exitExpression) {
			listener.exitExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: JSONVisitor<Result>): Result {
		if (visitor.visitExpression) {
			return visitor.visitExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ValueContext extends ParserRuleContext {
	public _string?: Token;
	public _number?: Token;
	public _exp?: ExpressionContext;
	public _object?: ObjContext;
	public _array?: ArrContext;
	public _true?: Token;
	public _false?: Token;
	public _null?: Token;
	public STRING(): TerminalNode | undefined { return this.tryGetToken(JSONParser.STRING, 0); }
	public NUMBER(): TerminalNode | undefined { return this.tryGetToken(JSONParser.NUMBER, 0); }
	public expression(): ExpressionContext | undefined {
		return this.tryGetRuleContext(0, ExpressionContext);
	}
	public obj(): ObjContext | undefined {
		return this.tryGetRuleContext(0, ObjContext);
	}
	public arr(): ArrContext | undefined {
		return this.tryGetRuleContext(0, ArrContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return JSONParser.RULE_value; }
	// @Override
	public enterRule(listener: JSONListener): void {
		if (listener.enterValue) {
			listener.enterValue(this);
		}
	}
	// @Override
	public exitRule(listener: JSONListener): void {
		if (listener.exitValue) {
			listener.exitValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: JSONVisitor<Result>): Result {
		if (visitor.visitValue) {
			return visitor.visitValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


