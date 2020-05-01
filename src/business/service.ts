import * as winston from "winston";
import * as util from "util";
import { IServiceTrigger } from "./trigger/serviceTrigger";
import { ServiceWithoutTrigger } from "./trigger/serviceWithoutTrigger";
import { Route } from "./route";
import { IAuthentication } from "./authentication/authentication";

export class Service {
    private _mockName: string;
    private _name : string;
    private _soapAction : string | undefined;
    private _authentication : IAuthentication | undefined;
    private _triggers : IServiceTrigger[];
    private _route : Route;

    constructor() {
        this._mockName = "";
        this._name = "";
        this._triggers = [];
        this._route = new Route();
    }

    public generate() {
        winston.debug("Service.generate");

        var code = this.generateService("\t");
        code += this.generateContextService();
        return code;
    }

    private generateService(tab: string) {
        winston.debug("Service.generateService");

        // Generate response handler
        var code = tab + util.format("public static async %s(req: Request, res: Response) {\n", this.methodName);

        // Define context
        code += tab + "\tconst context = new Context(req);\n";

        // Manage authentication
        if ( this.authentication ) {
            code += this.authentication.generate(tab + "\t", this.methodName);
            code += tab + "\tif ( authenticationSucceed ) {\n";
            code += tab + util.format("\t\t%s._%s(context, res);\n", this.mockName, this.methodName);
            code += tab + "\t}\n";
        } else {
            code += tab + util.format("\t%s._%s(context, res);\n", this.mockName, this.methodName);
        }
        code += tab + "}\n";

        // Generate business method
        code += tab + util.format("public static async _%s(context: Context, res: Response) {\n", this.methodName);

        // Apply triggers
        code += tab + "\tvar triggerApplied = false, expression, evaluation;\n\n"
        this._triggers.forEach(trigger => {
            code += trigger.generate(tab + "\t");
        });        

        // Apply a default trigger if there are no trigger to apply
        code += tab + "\tif ( !triggerApplied ) {\n";
        code += tab + util.format("\t\twinston.warn(\"%s.%s: No trigger to apply\");\n", this.mockName, this.methodName);
        code += tab + "\t\tResponseHandler.sendError(res, \"No trigger to apply\", \"\");\n";
        code += tab + "\t}\n";

        code += tab + "}\n";

        return code;
    }

    private generateContextService() {
        winston.debug("Service.generateContextService");
        return "";
    }

    public generateRoute() {
        winston.debug("Service.generateRoute");
        return this._route.generate(this.mockName ,this);
    }

    public addTrigger(trigger: IServiceTrigger) {
        this._triggers.push(trigger);
    }

    public get name() {
        return this._name;
    }
    public set name(value) {
        this._name = value;
    }

    public get route() {
        return this._route;
    }
    public set route(value) {
        this._route = value;
    }

    public get authentication() {
        return this._authentication;
    }
    public set authentication(value) {
        this._authentication = value;
    }

    public get mockName() {
        return this._mockName;
    }
    public set mockName(value) {
        this._mockName = value;
    }

    public get soapAction() {
        return this._soapAction;
    }
    public set soapAction(value) {
        this._soapAction = value;
    }

    public get methodName() {
        return this._name.replace(" ", "_").toLowerCase();
    }
}