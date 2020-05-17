import * as winston from "winston";
import * as util from "util";
import { Service } from "./service";

export class Route {

    private _path : string;
    private _method : string;

    constructor() {
        this._path = "";
        this._method = "";
    }

    public generate(mockName: string, service: Service) {
        winston.debug("Route.generate");
        var code = "";
        code += util.format("\t\tthis.router.route(\"%s/_behaviour/:name\").get(%s._%s_getBehaviour);\n", this.path, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"%s/_behaviour/\").get(%s._%s_getAllBehaviours);\n", this.path, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"%s/_behaviour/\").post(%s._%s_createBehaviour);\n", this.path, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"%s/_behaviour/:name\").delete(%s._%s_deleteBehaviour);\n", this.path, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"%s/_behaviour\").delete(%s._%s_deleteAllBehaviours);\n", this.path, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"%s\").%s(%s.%s);\n", this.path, this.method.toLowerCase(), mockName, service.methodName);
        return code;
    }

    public get path() {
        return this._path;
    }
    public set path(value) {
        this._path = value;
    }

    public get method() {
        return this._method;
    }
    public set method(value) {
        this._method = value;
    }

    public get paths() {
        return this._path.split("/");
    }
}