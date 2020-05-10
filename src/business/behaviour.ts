import * as winston from "winston";
import * as util from "util";
import { IServiceAction } from "./action/serviceAction";

export class Behaviour {
    private _name: string | undefined;
    private _repeat: number | undefined;
    private _mockName: string | undefined;
    private _serviceName: string | undefined;
    private _conditions: string[];
    private _actions: IServiceAction[];

    constructor() {
        this._actions = [];
        this._conditions = [];
    }

    public generate(tab: string) {
        winston.debug("Behaviour.generate");
        var code = "";
        code += tab + util.format("key = \"%s__%s\";\n", this.mockName, this.serviceName);
        code += tab + util.format("behaviour = await BehaviourManager.getBehaviour(key, \"%s\");\n", this.name);
        code += tab + "if ( !triggerApplied && behaviour ) {\n";
        code += tab + "\tvar conditionsPassed = true, expression;\n\n";
        code += this.generateCondition(tab + "\t");
        code += tab + "\tif ( conditionsPassed ) {\n\n";
        code += tab + "\t\t// Apply the behaviour\n";
        if ( this.repeat ) {
            code += tab + util.format("\t\tconst repeat = behaviour.repeat || %d;\n", this.repeat);
        } else {
            code += tab + "\t\tconst repeat = behaviour.repeat as number || -1;\n";
        }
        code += tab + util.format("\t\tawait BehaviourManager.decreaseRepeat(key, \"%s\", repeat);\n", this.name);
        code += tab + "\t\ttriggerApplied = true;\n\n";
        this._actions.forEach(action => {
            code += action.generate(tab + "\t\t");
        });
        code += tab + "\t}\n";
        code += tab + "}\n\n";
        return code;
    }

    private generateCondition(tab: string) {
        winston.debug("Behaviour.generateCondition");
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
        this._actions.push(action);
    }

    public addCondition(condition: string) {
        this._conditions.push(condition);
    }

    public get name() {
        return this._name;
    }
    public set name(value) {
        this._name = value;
    }

    public get repeat() {
        return this._repeat;
    }

    public set repeat(value) {
        this._repeat = value;
    }

    public get mockName() {
        return this._mockName;
    }

    public set mockName(value) {
        this._mockName = value;
    }

    public get serviceName() {
        return this._serviceName;
    }

    public set serviceName(value) {
        this._serviceName = value;
    }
}