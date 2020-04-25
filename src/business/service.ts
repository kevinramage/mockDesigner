import * as winston from "winston";
import * as util from "util";
import { IServiceTrigger } from "./trigger/serviceTrigger";
import { ServiceWithoutTrigger } from "./trigger/serviceWithoutTrigger";
import { Route } from "./route";
import { IAuthentication } from "./authentication/authentication";

export class Service {
    private _mockName: string;
    private _name : string;
    private _authentication : IAuthentication | undefined;
    private _trigger : IServiceTrigger;
    private _route : Route;

    constructor() {
        this._mockName = "";
        this._name = "";
        this._trigger = new ServiceWithoutTrigger();
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
        if ( this.authentication ) {
            code += this.authentication.generate(tab + "\t", this.methodName);
            code += tab + "\tif ( authenticationSucceed ) {\n";
            code += tab + util.format("\t\t%s._%s(req, res);\n", this.mockName, this.methodName);
            code += tab + "\t}\n";
        } else {
            code += tab + util.format("\t%s._%s(req, res);\n", this.mockName, this.methodName);
        }
        code += tab + "}\n";

        // Generate business method
        code += tab + util.format("public static async _%s(req: Request, res: Response) {\n", this.methodName);
        code += this._trigger.generate(tab + "\t");
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

    public get name() {
        return this._name;
    }
    public set name(value) {
        this._name = value;
    }

    public get trigger() {
        return this._trigger;
    }
    public set trigger(value) {
        this._trigger = value;
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

    public get methodName() {
        return this._name.replace(" ", "_").toLowerCase();
    }
}