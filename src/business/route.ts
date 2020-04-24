import * as winston from "winston";
import * as util from "util";
import { Service } from "./service";
import { Mock } from "./mock";

export class Route {

    private _path : string;
    private _method : string;

    constructor() {
        this._path = "";
        this._method = "";
    }

    public generate(mock: Mock, service: Service) {
        winston.debug("Route.generate");
        return util.format("this.router.route(\"%s\").%s(%s.%s);\n", this.path, this.method.toLowerCase(), mock.controllerName, service.methodName);
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