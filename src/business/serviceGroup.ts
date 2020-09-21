import { Route } from "./route";
import * as util from "util";
import * as winston from "winston";
import { Service } from "./service";
import { RouteSolver } from "./routeSolver";

export class ServiceGroup {
    private static counter : number = 1;
    private _id: number;
    private _mockName : string;
    private _services : Service[];
    private _route : Route;

    constructor() {
        this._id = ServiceGroup.counter++;
        this._mockName = "";
        this._services = [];
        this._route = new Route();
    }

    public generate() {
        var code = "";
        code += this.generateServiceGroup("\t");
        this.services.forEach(service => { code += service.generate(); })
        return code;
    }

    private generateServiceGroup(tab: string) {
        var code = "";
        if ( this.services.length > 1 ) {
            code += tab + util.format("public static async serviceGroup%d(req: Request, res: Response) {\n", this._id);
            
            // Generate first soap action
            code += tab + util.format("\tconst soapHeader = req.headers[\"soapaction\"];\n");
            code += tab + util.format("\tif ( soapHeader && soapHeader == \"%s\") {\n", this.services[0].soapAction);
            code += tab + util.format("\t\t%s.%s(req, res);\n", this.mockName, this.services[0].methodName);
            code += tab + util.format("\t}");

            // Generate others soap actions
            for ( var i = 1; i < this.services.length; i++) {
                code += tab + util.format("else if ( soapHeader && soapHeader == \"%s\") {\n", this.services[i].soapAction);
                code += tab + util.format("\t\t%s.%s(req, res);\n", this.mockName, this.services[i].methodName);
                code += tab + util.format("\t}");
            }
            code += tab + util.format("else {\n");
            code += tab + util.format("\t\t%s._defaultResponse(req, res);\n", this.mockName);
            code += tab + util.format("\t}\n");

            code += tab + util.format("}\n");
        }
        return code;
    }

    public addRoute() {
        if ( this.services.length > 1 ) {
            const functionName = util.format("%s.%s", this.mockName, "serviceGroup" + this._id);
            RouteSolver.instance.addRoute(this.route.method, this.route.path, functionName);
        } else if ( this.services.length > 0 ) {
            const functionName = util.format("%s.%s", this.mockName, this.services[0].methodName);
            RouteSolver.instance.addRoute(this.route.method, this.route.path, functionName);
        }
    }

    public generateRoute() {
        winston.debug("Service.generateRoute");
        return this._route.generate(this.mockName ,this);
    }

    public addService(service: Service) {
        service.mockName = this.mockName;
        this._services.push(service);
    }

    public get mockName() {
        return this._mockName;
    }
    public set mockName(value) {
        this._mockName = value;
        this._services.forEach(service => { service.mockName = value; })
    }

    public get services() {
        return this._services;
    }

    public get route() {
        return this._route;
    }
    public set route(value) {
        this._route = value;
    }
}