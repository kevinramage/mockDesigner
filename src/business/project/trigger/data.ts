import { DATATRIGGER_OPERATION } from "../../utils/enum";
import { Context } from "../../core/context";
import { Trigger } from "../trigger";

export class DataTrigger extends Trigger {
    private _conditions: DataTriggerCondition[];

    constructor() {
        super();
        this._conditions = [];
    }

    public check(context: Context){
        let result = true;
        this.conditions.forEach(condition => {
            if (!condition.check(context)) {
                result = false;
            }
        });
        return result;
    }

    public addCondition(condition: DataTriggerCondition) {
        this._conditions.push(condition);
    }

    public get conditions() {
        return this._conditions;
    }
}

export class DataTriggerCondition {
    private _left: string;
    private _right: string;
    private _operation: string;

    constructor() {
        this._left = "";
        this._right = "";
        this._operation = "";
    }

    public check(context: Context) {
        let values : string[] = [];
        let regex : RegExp;
        const leftOp = this.evaluateOperator(this.left, context);
        const rightOp = this.evaluateOperator(this.right, context);
        switch (this.operation) {
            case DATATRIGGER_OPERATION.EQUALS:
                return leftOp == rightOp;

            case DATATRIGGER_OPERATION.NOT_EQUALS:
                return leftOp != rightOp;

            case DATATRIGGER_OPERATION.MATCHES:
                regex = new RegExp(rightOp);
                return regex.exec(this.left) !== null;

            case DATATRIGGER_OPERATION.NOT_MATCHES:
                regex = new RegExp(rightOp);
                return regex.exec(this.left) !== null;

            case DATATRIGGER_OPERATION.IN:
                values = (rightOp as string).split(";");
                return values.includes(leftOp);

            case DATATRIGGER_OPERATION.NOT_IN:
                values = (rightOp as string).split(";");
                return !values.includes(leftOp);

            case DATATRIGGER_OPERATION.RANGE:
                values = (rightOp as string).split("...");
                const actual = Number.parseInt((leftOp as string));
                const min = Number.parseInt(values[0]);
                const max = Number.parseInt(values[1]);
                return actual >= min && actual <= max;
        }
    }

    private evaluateOperator(operator: string, context: Context) {
        if (operator.startsWith("{{") && operator.endsWith("}}")) {
            const expression = operator.substr(2, operator.length - 4);
            return context.variables[expression] || null;
        } else {
            return operator;
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