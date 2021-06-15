import { Context } from "../../core/context";
import { Authentication } from "../authentication";

export class BasicAuthentication extends Authentication {
    private _username : string;
    private _password : string;

    constructor() {
        super();
        this._username = "";
        this._password = "";
    }

    public authenticate(context: Context) {
        const authorizationHeader = context.request.headers["authorization"];
        if (authorizationHeader) {
            const data = authorizationHeader.substring(("Basic ").length);
            const buffer = Buffer.from(data, "base64");
            const decoded = buffer.toString("ascii");
            const index = decoded.indexOf(":");
            if ( index != -1 ) {
                const userName = decoded.substring(0, index);
                const password = decoded.substring(index+1);
                if ( userName == this.username && password == this.password ) {
                    return true;
                } else {
                    this.sendAccessForbidden(context);
                    return false;
                }
            } else {
                this.sendAuthenticationRequired(context);
                return false;
            }
        } else {
            this.sendAuthenticationRequired(context);
            return false;
        }
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