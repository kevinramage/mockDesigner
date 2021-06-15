import { Context } from "../../business/core/context";
import { ACTIONS } from "../utils/enum";

export class Action {
    private _type : string;

    constructor() {
        this._type = ACTIONS.MESSAGE;
    }

    public execute(context: Context) {
        
    }

    public get type() {
        return this._type;
    }
}