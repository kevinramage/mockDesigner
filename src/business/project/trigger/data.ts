import { Context } from "../../core/context";
import { Trigger } from "../trigger";
import { Condition } from "../../core/condition";

export class DataTrigger extends Trigger {
    private _conditions: Condition[];

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

    public addCondition(condition: Condition) {
        this._conditions.push(condition);
    }

    public get conditions() {
        return this._conditions;
    }
}