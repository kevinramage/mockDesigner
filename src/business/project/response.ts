import { Context } from "../../business/core/context";
import { Trigger } from "./trigger";

export class Response {
    private _triggers : Array<Trigger>;

    constructor() {
        this._triggers = [];
    }

    public addTrigger(trigger: Trigger) {
        this._triggers.push(trigger);
    }

    public execute(context: Context) {
        for ( var index in this.triggers ) {
            const trigger = this.triggers[index];
            if (trigger.check(context)) {
                trigger.execute(context);
            }
        }
    }

    public get triggers() {
        return this._triggers;
    }
}