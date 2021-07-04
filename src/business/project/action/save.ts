import { ACTIONS } from "../../utils/enum";
import { Context } from "../../core/context";
import { ExpressionManager } from "../../core/expressionManager";
import { StorageManager } from "../../core/storageManager";
import { Action } from "../action";

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
        return new Promise<void>(async (resolve, reject) => {
            try {
                for (var key in this.expressions) {
                    const expression = this.expressions[key];
                    let value = ExpressionManager.instance.evaluateExpression(context, expression.value);
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
            key: this.key
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