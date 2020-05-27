import * as winston from "winston";
import * as util from "util";
import { IServiceTrigger } from "./serviceTrigger";
import { IServiceAction } from "../action/serviceAction";

export class ServiceData implements IServiceTrigger {

    private _conditions : string[];
    private _actions :  IServiceAction[];

    constructor() {
        this._conditions = [];
        this._actions = [];
    }
    
    public generate(mockName: string, serviceName: string, tab: string) {
        winston.debug("ServiceData.generate");
        var code = "";
        code += tab + "if ( !triggerApplied ) {\n";
        code += tab + "\tvar conditionsPassed = true, expression;\n\n";
        code += this.generateCondition(tab + "\t");
        code += tab + "\tif ( conditionsPassed ) {\n\n";
        code += tab + "\t\t// Apply action linked\n";
        code += tab + "\t\ttriggerApplied = true;\n\n";
        this._actions.forEach(action => {
            code += action.generate(tab + "\t\t");
        });
        code += tab + "\t}\n";
        code += tab + "}\n\n";

        return code;
    }

    private generateCondition(tab: string) {
        winston.debug("ServiceData.generateCondition");
        var code = "";
        this._conditions.forEach(condition => {
            code += tab + util.format("// Evaluation %s\n", condition);
            code += tab + util.format("expression = await TemplateManager.instance.evaluate(\"%s\", context);\n", condition);
            code += tab + "try {\n";
            code += tab + "\tevaluation = eval(expression);\n";
            code += tab + "\tif ( !evaluation ) {\n";
            code += tab + "\t\tconditionsPassed = false;\n"
            code += tab + "\t}\n"
            code += tab + "} catch (err) {\n";
            code += tab + "\tevaluation = false;\n"
            code += tab + "}\n\n";

        });
        return code;
    }

    public addAction(action: IServiceAction) {
        winston.debug("ServiceData.addAction");
        this._actions.push(action);
    }

    public addCondition(condition: string) {
        winston.debug("ServiceData.addExpression");
        this._conditions.push(condition);
    }
}