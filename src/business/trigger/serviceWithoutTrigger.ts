import * as winston from "winston";
import { IServiceTrigger } from "./serviceTrigger";
import { IServiceAction } from "business/action/serviceAction";

export class ServiceWithoutTrigger implements IServiceTrigger {

    private _actions : IServiceAction[];

    constructor() {
        this._actions = [];
    }

    public generate(tab: string) {
        winston.debug("ServiceWithoutTrigger.generate");
        var code = tab + "if ( !triggerApplied ) {\n\n";
        this._actions.forEach(action => {
            code += action.generate(tab + "\t");
        });
        code += tab + "\ttriggerApplied = true;\n";
        code += tab + "}\n";
        code += "\n\n";
        return code;
    }

    public addAction(action: IServiceAction) {
        this._actions.push(action);
    }
}