import { Context } from "../../core/context";
import { Trigger } from "../trigger";
import { Condition } from "../../core/condition";
import { TRIGGERS } from "../../utils/enum";

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

    public toObject() {
        return {
            type: this.type,
            conditions: this.conditions.map(c => { return c.toObject() }),
            actions: this.actions.map(a => { return a.toObject() })
        }
    }

    public toCode() : any{
        return {
            type: this.type,
            conditions: this.conditions.map(c => { return c.toCode(); }),
            actions: this.actions.map(a => { return a.toObject(); })
        };
    }

    public get conditions() {
        return this._conditions;
    }
}