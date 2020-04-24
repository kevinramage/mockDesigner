import * as winston from "winston";
import * as util from "util";
import { IServiceTrigger } from "./trigger/serviceTrigger";
import { ServiceWithoutTrigger } from "./trigger/serviceWithoutTrigger";
import { Route } from "./route";
import { Mock } from "./mock";

export class Service {
    private _name : string;
    private _trigger : IServiceTrigger;
    private _route : Route;

    constructor() {
        this._name = "";
        this._trigger = new ServiceWithoutTrigger();
        this._route = new Route();
    }

    public generate() {
        winston.debug("Service.generate");
        var code = this.generateService();
        code += this.generateContextService();
        return code;
    }

    private generateService() {
        winston.debug("Service.generateService");
        var code = util.format("\tpublic static async %s(req: Request, res: Response) {\n", this.methodName);
        code += this._trigger.generate();
        code += "\t}\n";
        return code;
    }

    private generateContextService() {
        winston.debug("Service.generateContextService");
        return "";
    }

    public generateRoute(mock: Mock) {
        winston.debug("Service.generateRoute");
        return this._route.generate(mock, this);
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

    public get methodName() {
        return this._name.replace(" ", "_").toLowerCase();
    }
}