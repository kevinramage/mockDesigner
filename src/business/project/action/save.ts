import { ACTIONS } from "../../utils/enum";
import { Context } from "../../core/context";
import { ExpressionManager } from "../../core/expressionManager";
import { StorageManager } from "../../core/storageManager";
import { Action } from "../action";
import * as winston from "winston";

export class SaveAction extends Action {
    private _key: string;
    private _expressions: SaveExpression[];

    constructor() {
        super();
        this._key = "";
        this._expressions = [];
    }

    public addExpression(expression: SaveExpression) {
        this._expressions.push(expression);
    }

    public execute(context: Context) {
        winston.debug("SaveAction.execute - Execute action: " + this.type);
        return new Promise<void>(async (resolve, reject) => {
            try {
                for (var key in this.expressions) {
                    const expression = this.expressions[key];
                    let value = await ExpressionManager.instance.evaluateExpression(context, expression.value);
                    value = ExpressionManager.instance.expressionToString(value);
                    await StorageManager.instance.storeValue(this.key, expression.key, value);
                }
                resolve();
            } catch (err) {
                reject(err)
            }
        });
    }

    public toObject() {
        return {
            type: ACTIONS.SAVE,
            key: this.key,
            expressions: this.expressions.map(e => { return e.toObject(); })
        }
    }

    public toCode() {
        return {
            type: this.type,
            key: this.key,
            expressions: this.expressions.map(e => { return e.toCode(); })
        }
    }

    public get key() {
        return this._key;
    }
    public set key(value) {
        this._key = value;
    }

    public get expressions() {
        return this._expressions;
    }
}

export class SaveExpression {
    private _key: string;
    private _value: string;

    constructor() {
        this._key = "";
        this._value = "";
    }

    public toObject() {
        return {
            key: this.key,
            value: this.value
        }
    }

    public toCode() {
        return {
            key: this.key,
            value: this.value
        }
    }

    public get key() {
        return this._key;
    }
    public set key(value) {
        this._key = value;
    }

    public get value() {
        return this._value;
    }
    public set value(value) {
        this._value = value;
    }
}