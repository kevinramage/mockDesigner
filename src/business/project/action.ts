import { Context } from "../../business/core/context";
import { ACTIONS } from "../utils/enum";
import { Trigger } from "./trigger";

export class Action {
    private _type : string;

    constructor() {
        this._type = ACTIONS.MESSAGE;
    }

    public execute(context: Context) : Promise<void> {
        return new Promise<void>(resolve => {
            resolve();
        });
    }

    public toObject() {
        return {}
    }

    public toCode() {
        return {
            type: this.type
        }
    }

    public get type() {
        return this._type;
    }
}