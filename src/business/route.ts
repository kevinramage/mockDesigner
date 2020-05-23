import * as winston from "winston";
import * as util from "util";
import { Service } from "./service";

export class Route {

    private _path : string;
    private _pingPath : string;
    private _method : string;

    constructor() {
        this._path = "";
        this._pingPath = "";
        this._method = "";
    }

    public generate(mockName: string, service: Service) {
        winston.debug("Route.generate");
        var code = "";
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_getServiceCounter\").get(%s._%s_getServiceCounter);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_resetServiceCounter\").post(%s._%s_resetServiceCounter);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_updateServiceCounter\").put(%s._%s_updateServiceCounter);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_getDatabaseValue\").get(%s._%s_getDatabaseValue);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_resetDatabaseCounter\").post(%s._%s_resetDatabaseCounter);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_updateDatabaseValue\").put(%s._%s_updateDatabaseValue);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_deleteDatabaseValue\").delete(%s._%s_deleteDatabaseValue);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_ping\").get(%s._%s_ping);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_behaviour/:name\").get(%s._%s_getBehaviour);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_behaviour/\").get(%s._%s_getAllBehaviours);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_behaviour/\").post(%s._%s_createBehaviour);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_behaviour/:name\").delete(%s._%s_deleteBehaviour);\n", service.methodName, service.mockName, service.methodName);
        code += util.format("\t\tthis.router.route(\"/api/v1/%s/_behaviour\").delete(%s._%s_deleteAllBehaviours);\n", service.methodName, service.mockName, service.methodName);
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

    public get pingPath() {
        return this._pingPath;
    }
    public set pingPath(value) {
        this._pingPath = value;
    }

    public get paths() {
        return this._path.split("/");
    }
}