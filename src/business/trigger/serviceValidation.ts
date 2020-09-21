import * as winston from "winston";
import * as util from "util";
import { IServiceAction } from "../action/serviceAction";
import { IServiceTrigger } from "./serviceTrigger";
import { EnumField } from "../../templates/enumField";

export class ServiceValidation implements IServiceTrigger {

    private _mandatoriesFields : string[];
    private _enumFields : EnumField[]
    private _actions : IServiceAction[];

    constructor() {
        this._mandatoriesFields = [];
        this._enumFields = [];
        this._actions = [];
    }

    generate(mockName: string, serviceName: string, tab: string): string {
        winston.debug("ServiceValidation.generate");
        var code = "";

        // Check another trigger not applied
        code += tab + util.format("if ( !triggerApplied ) {\n");

        // Call validation tools to analyse mandatories fields
        code += tab + util.format("\tconst mandatoriesFields : string[] = [];\n");
        code += tab + util.format("\tconst enumFields : EnumField[] = [];\n");
        code += tab + util.format("\tvar enumField : EnumField;\n");
        this._mandatoriesFields.forEach(f => {
            code += tab + util.format("\tmandatoriesFields.push(\"%s\");\n", f);
        });
        this._enumFields.forEach(f => {
            code += tab + util.format("\tenumField = new EnumField(\"%s\");\n", f.field);
            f.values.forEach(v => {
                code += tab + util.format("\tenumField.addValue(\"%s\");\n", v);
            });
            code += tab + util.format("\tenumFields.push(enumField);\n");
        });
        code += tab + util.format("\tconst validationResult = ValidationUtils.validate(context, mandatoriesFields, enumFields);\n\n");

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
        this._mandatoriesFields.push(mandatoryField);
    }

    public addEnumField(enumField: EnumField) {
        this._enumFields.push(enumField);
    }

    public addAction(action: IServiceAction) {
        this._actions.push(action);
    }
}