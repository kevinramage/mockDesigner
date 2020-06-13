import * as winston from "winston";
import * as util from "util";
import { IServiceAction } from "../action/serviceAction";
import { IServiceTrigger } from "./serviceTrigger";

export class ServiceValidation implements IServiceTrigger {

    private _mandatoriesField : string[];
    private _actions : IServiceAction[];

    constructor() {
        this._mandatoriesField = [];
        this._actions = [];
    }

    generate(mockName: string, serviceName: string, tab: string): string {
        winston.debug("ServiceValidation.generate");
        var code = "";

        // Check another trigger not applied
        code += tab + util.format("if ( !triggerApplied ) {\n");

        // Call validation tools to analyse mandatories fields
        code += tab + util.format("\tconst mandatoriesFields : string[] = [];\n");
        this._mandatoriesField.forEach(f => {
            code += tab + util.format("\tmandatoriesFields.push(\"%s\");\n", f);
        });
        code += tab + util.format("\tconst validationResult = ValidationUtils.validate(context, mandatoriesFields);\n\n");

        // Call actions when request is invalid
        code += tab + util.format("\tif ( validationResult != \"\" ) {\n");
        code += tab + util.format("\t\tcontext.addMessage(validationResult);\n\n");
        this._actions.forEach(action => {
            code += action.generate(tab + "\t\t");
        });
        code += tab + util.format("\t\ttriggerApplied = true;\n")
        code += tab + util.format("\t}\n");

        code += tab + util.format("}\n\n");


        return code;
    }

    public addMandoryField(mandatoryField: string) {
        this._mandatoriesField.push(mandatoryField);
    }

    public addAction(action: IServiceAction) {
        this._actions.push(action);
    }
}