import * as winston from "winston";
import * as util from "util";
import { IServiceTrigger } from "./serviceTrigger";
import { IServiceAction } from "../action/serviceAction";
import { Condition } from "../../templates/condition";

export class ServiceData implements IServiceTrigger {

    private _conditions : Condition[];
    private _actions :  IServiceAction[];

    constructor() {
        this._conditions = [];
        this._actions = [];
    }
    
    public generate(mockName: string, serviceName: string, tab: string) {
        winston.debug("ServiceData.generate");
        var code = "";
        code += tab + "if ( !triggerApplied ) {\n";
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
        code += tab + "// Conditions\n";
        code += tab + "var condition : Condition;\n"
        code += tab + "const conditions : Condition[] = [];\n";
        this._conditions.forEach(condition => {
            code += tab + util.format("condition = new Condition(\"%s\", \"%s\", \"%s\");\n", condition.leftOperand, condition.operation, condition.rightOperand);
            code += tab + "conditions.push(condition);\n";
        });
        code += tab + "const conditionEvaluator = new ConditionEvaluator();\n";
        code += tab + "const conditionsPassed = await conditionEvaluator.evaluateConditions(context, conditions);\n";

        return code;
    }

    public addAction(action: IServiceAction) {
        winston.debug("ServiceData.addAction");
        this._actions.push(action);
    }

    public addCondition(condition: Condition) {
        winston.debug("ServiceData.addExpression");
        this._conditions.push(condition);
    }
}