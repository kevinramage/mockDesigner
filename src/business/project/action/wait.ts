import { ACTIONS } from "../../utils/enum";
import { Context } from "../../core/context";
import { Action } from "../action";

export class WaitAction extends Action {
    private _time : number;

    constructor() {
        super();
        this._time = 0;
    }

    public execute(context: Context) {
        return new Promise<void>(resolve => {
            setTimeout(resolve, this.time);
        });
    }

    public toObject() {
        return {
            type: ACTIONS.WAIT,
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