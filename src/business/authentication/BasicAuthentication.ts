import * as winston from "winston";
import * as util from "util";
import { IAuthentication } from "./authentication";

export class BasicAuthentication implements IAuthentication {
    private _username : string;
    private _password : string;

    constructor() {
        this._username = "";
        this._password = "";
    }

    public generate(tab: string) {
        winston.debug("BasicAuthentication.generate");
        var code = "";
        code += tab + util.format("const authenticationSucceed = AuthenticationManager.basicAuthentication(\"%s\", \"%s\", req, res);\n", this.username, this.password);
        return code;
    }

    public get username() {
        return this._username;
    }
    public set username(value) {
        this._username = value;
    }

    public get password() {
        return this._password;
    }
    public set password(value) {
        this._password = value;
    }
}