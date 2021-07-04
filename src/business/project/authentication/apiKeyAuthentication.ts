import { APIKEY_SOURCES, AUTHENTICATIONS } from "../../utils/enum";
import { Context } from "../../core/context";
import { Authentication } from "../authentication";

export class ApiKeyAuthentication extends Authentication {
    private _source : string;
    private _key : string;
    private _value : string;

    constructor() {
        super();
        this._source = "";
        this._key = "";
        this._value = "";
    }

    public authenticate(context: Context) {
        if (this.source === APIKEY_SOURCES.HEADER) {
            const header = context.request.headers[this.key];
            if (header) {
                if (header == this.value) {
                    return true;
                } else {
                    this.sendAccessForbidden(context);
                    return false;
                }
            } else {
                this.sendAuthenticationRequired(context);
                return false;
            }
        } else if (this.source === APIKEY_SOURCES.QUERY) {
            const queryParam = context.request.query[this.key];
            if (queryParam) {
                if (queryParam == this.value) {
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

    public toObject() {
        return {
            type: AUTHENTICATIONS.APIKEY,
            source: this.source,
            key: this.key,
            value: this.value
        }
    }

    public get key() {
        return this._key;
    }

    public set key(value) {
        this._key = value;
    }

    public get value() {
        return this._value;
    }

    public set value(value) {
        this._value = value;
    }

    public get source() {
        return this._source;
    }

    public set source(value) {
        this._source = value;
    }
}