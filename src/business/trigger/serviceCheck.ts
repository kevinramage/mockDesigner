import * as winston from "winston";
import * as util from "util";
import { IServiceTrigger } from "./serviceTrigger";
import { IServiceAction } from "business/action/serviceAction";

export class ServiceCheck implements IServiceTrigger {

    private _mandatories : string[];
    private _actions :  IServiceAction[];

    constructor() {
        this._mandatories = [];
        this._actions = [];
    }

    generate(mockName: string, tab: string) {
        winston.debug("ServiceCheck.generate");
        var code = "";
        if ( this._mandatories.length > 0 ) {

            // Generate code to check mandatories 
            const fields = this._mandatories.map(mandatory => { return util.format("\"%s\"", mandatory) }).join(",");
            code += tab + "if ( !triggerApplied ) {\n";
            code += tab + util.format("\tconst mandatoryFields = [%s];\n", fields);
            code += tab + "\tmandatoryFields.forEach(async mandatory => {\n";
            code += tab + "\t\tif ( !triggerApplied && !XMLUtils.exists(context?.request?.body, mandatory )) {\n";
            code += tab + "\t\t\ttriggerApplied = true;\n"

            // Actions
            this._actions.forEach(action => {
                code += action.generate(tab + "\t\t\t" );
            });

            code += tab + "\t\t}\n";
            code += tab + "\t});\n"
            code += tab + "}\n";

            code += tab + "\n\n";
        }

        return code;
    }

    addMandatory(mandatory: string) {
        this._mandatories.push(mandatory);
    }

    addAction(action: IServiceAction) {
        winston.debug("ServiceData.addAction");
        this._actions.push(action);
    }
}