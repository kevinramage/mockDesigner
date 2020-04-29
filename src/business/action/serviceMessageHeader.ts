import * as winston from "winston";
import * as util from "util";

export class ServiceMessageHeader {
    private _key : string;
    private _value : string;

    constructor() {
        this._key = "";
        this._value = "";
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