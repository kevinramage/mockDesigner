import * as winston from "winston";
import { IServiceTrigger } from "./serviceTrigger";
import { IServiceAction } from "business/action/serviceAction";

export class ServiceWithoutTrigger implements IServiceTrigger {

    private _actions : IServiceAction[];

    constructor() {
        this._actions = [];
    }

    public generate() {
        winston.debug("ServiceWithoutTrigger.generate");
        var code = "";
        this._actions.forEach(action => {
            code += action.generate();
        });
        return code;
    }

    public addAction(action: IServiceAction) {
        this._actions.push(action);
    }
}