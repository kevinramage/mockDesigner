import { ACTIONS } from "../../utils/enum";
import { Context } from "../../core/context";
import { Action } from "../action";
import * as winston from "winston";

export class WaitAction extends Action {
    private _time : number;

    constructor() {
        super();
        this._time = 0;
    }

    public execute(context: Context) {
        winston.debug("WaitAction.execute - Execute action: " + this.type);
        return new Promise<void>(resolve => {
            setTimeout(resolve, this.time);
        });
    }

    public toObject() {
        return {
            type: this.type,
            time: this.time
        }
    }

    public toCode() {
        return { 
            type: this.type,
            time: this.time
        }
    }

    public get time() {
        return this._time;
    }

    public set time(value) {
        this._time = value;
    }
}