import * as winston from "winston";
import * as util from "util";
import { IServiceTrigger } from "./serviceTrigger";
import { IServiceAction } from "../action/serviceAction";

export class ServiceData implements IServiceTrigger {

    private _expression : string | undefined;
    private _actions :  IServiceAction[];

    constructor() {
        this._actions = [];
    }
    
    public generate(tab: string) {
        winston.debug("ServiceData.generate");
        var code = "";

        // Evaluate expression
        code += tab + util.format("expression = await TemplateManager.instance.evaluate(\"%s\", context);\n", this.expression);
        code += tab + "winston.info(\"Expression to evaluate:\" + expression);\n";
        code += tab + "try {\n"
        code += tab + "\tevaluation = eval(expression);\n";
        code += tab + "} catch (err) {\n"
        code += tab + "\twinston.warn(\"An error occured during the expression evaluation: \", err);\n";
        code += tab + "}\n\n"

        // Apply actions
        code += tab + "if ( evaluation ) {\n";
        code += tab + "\ttriggerApplied = true;\n";
        this._actions.forEach(action => {
            code += action.generate(tab + "\t" );
        });
        code += tab + "\treturn;\n";
        code += tab + "}\n\n\n";

        return code;
    }

    public addAction(action: IServiceAction) {
        winston.debug("ServiceData.addAction");
        this._actions.push(action);
    }

    public get expression() {
        return this._expression;
    }
    public set expression(value) {
        this._expression = value;
    }
}