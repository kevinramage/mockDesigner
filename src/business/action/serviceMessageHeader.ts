import * as winston from "winston";
import * as util from "util";

export class ServiceMessageHeader {
    private _key : string;
    private _value : string;

    constructor() {
        this._key = "";
        this._value = "";
    }

    public generate(tab : string) {
        winston.debug("ServiceMessageHeader.generate");
        // Interpolation
        const headerName = this._key;
        const headerValue = this._value;
        return tab + util.format("res.setHeader('%s', '%s');\n", headerName, headerValue);
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
}