import * as winston from "winston";
import * as util from "util";
import { IAuthentication } from "./authentication";

export class ApiKeyAuthentication implements IAuthentication {
    private _source : string;
    private _keyName : string;
    private _keyValue : string;

    constructor() {
        this._source = "";
        this._keyName = "";
        this._keyValue = "";
    }

    public generate(tab: string, methodName: string) {
        winston.debug("ApiKeyAuthentication.generate");
        var code = "";
        code += tab + util.format("const authenticationSucceed = AuthenticationManager.apiKeyAuthentication(\"%s\", \"%s\", \"%s\", req, res);\n", this.source, this.keyName, this.keyValue);
        return code;
    }

    public get source() {
        return this._source;
    }
    public set source(value) {
        this._source = value;
    }

    public get keyName() {
        return this._keyName;
    }
    public set keyName(value) {
        this._keyName = value;
    }

    public get keyValue() {
        return this._keyValue;
    }
    public set keyValue(value) {
        this._keyValue = value;
    }
}