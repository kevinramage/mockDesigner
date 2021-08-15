import { Context } from "../../business/core/context";
import { TRIGGERS } from "../utils/enum";
import { Action } from "./action";
import * as winston from "winston";

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
        winston.debug("Trigger.execute - Execute trigger: " + this.type);
        return new Promise<void>(async (resolve, reject) => {
            try {
                for(var key in this.actions) {
                    const action = this.actions[key];
                    await action.execute(context);
                }
                resolve();
                
            } catch (err) {
                reject(err);
            }
        });
    }

    public addAction(action: Action) { 
        this._actions.push(action);
    }

    public toObject() : any {
        return {
            type: this.type,
            actions: this.actions.map(a => { return a.toObject(); })
        };
    }

    public toCode() {
        return {
            type: this.type,
            actions: this.actions.map(a => { return a.toCode(); })
        }
    }

    public get type() {
        return this._type;
    }

    public get actions() {
        return this._actions;
    }
}