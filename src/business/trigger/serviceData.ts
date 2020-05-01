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

        // Generate code to evaluate expression
        code += tab + "if ( !triggerApplied ) {\n";
        code += tab + util.format("\texpression = await TemplateManager.instance.evaluate(\"%s\", context);\n", this.expression);
        code += tab + "\twinston.info(\"Expression to evaluate:\" + expression);\n";
        code += tab + "\ttry {\n"
        code += tab + "\t\tevaluation = eval(expression);\n";
        code += tab + "\t} catch (err) {\n"
        code += tab + "\t\twinston.warn(\"An error occured during the expression evaluation: \", err);\n";
        code += tab + "\t}\n\n"

        // Execute actions
        code += tab + "\tif ( evaluation ) {\n";
        code += tab + "\t\ttriggerApplied = true;\n";
        this._actions.forEach(action => {
            code += action.generate(tab + "\t\t" );
        });
        code += tab + "\t}\n;"
        code += tab + "}\n;"
        
        code += "\n\n";

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