import { AUTHENTICATIONS } from "../../utils/enum";
import { Context } from "../../core/context";
import { Authentication } from "../authentication";

export class TokenAutentication extends Authentication {
    private _token : string;

    constructor() {
        super();
        this._token = "";
    }

    public authenticate(context: Context) {
        const authorizationHeader = context.request.headers["authorization"];
        if (authorizationHeader) {
            const data = authorizationHeader.substring(("Bearer ").length);
            console.info(data);
            console.info(this.token);
            if ( data == this.token ) {
                return true;
            } else {
                this.sendAccessForbidden(context);
                return false;
            }
        } else {
            this.sendAuthenticationRequired(context);
            return false;
        }
    }

    public toObject() {
        return {
            type: AUTHENTICATIONS.TOKEN,
            token: this.token
        }
    }

    public toCode() {
        return {
            type: AUTHENTICATIONS.TOKEN,
            token: this.token
        }
    }

    public get token() {
        return this._token;
    }

    public set token(value) {
        this._token = value;
    }
}