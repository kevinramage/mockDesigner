import { Context } from "../../business/core/context";
import { TRIGGERS } from "../utils/enum";
import { Action } from "./action";

export class Trigger {
    private _type : string;
    private _actions : Array<Action>;

    constructor() {
        this._type = TRIGGERS.NONE;
        this._actions = [];
    }

    public check(context : Context) {
        return true;
    }

    public execute(context: Context) {
        return new Promise<void>(async resolve => {
            for(var key in this.actions) {
                const action = this.actions[key];
                await action.execute(context);
            }
            resolve();
        });
    }

    public addAction(action: Action) { 
        this._actions.push(action);
    }

    public get type() {
        return this._type;
    }

    public get actions() {
        return this._actions;
    }
}