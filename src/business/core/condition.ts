import { Context } from "./context";
import { ExpressionManager } from "./expressionManager";

export class Condition {
    private _left: string;
    private _right: string;
    private _operation: string;

    constructor() {
        this._left = "";
        this._right = "";
        this._operation = "";
    }

    public check(context: Context) {
        return ExpressionManager.instance.evaluateCondition(context, this);
    }

    public toObject() {
        return {
            left: this.left,
            operation: this.operation,
            right: this.right
        }
    }

    public toCode() {
        return {
            leftOperand: this.left,
            operation: this.operation,
            rightOperand: this.right
        }
    }

    public get left() {
        return this._left;
    }
    public set left(value) {
        this._left = value;
    }

    public get right() {
        return this._right;
    }
    public set right(value) {
        this._right = value;
    }

    public get operation() {
        return this._operation;
    }
    public set operation(value) {
        this._operation = value;
    }
}