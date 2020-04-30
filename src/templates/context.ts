import { Request } from "express";

export class Context {
    private _request : Request | undefined;
    private _newIntegerId : number | undefined;
    private _newUUID : string | undefined ;

    constructor(request ?: Request) {
        this._request = request;
    }

    public get request() {
        return this._request;
    }
    public set request(value) {
        this._request = value;
    }
    public get newIntegerId() {
        return this._newIntegerId;
    }
    public set newIntegerId(value) {
        this._newIntegerId = value;
    }
    public get newUUID() {
        return this._newUUID;
    }
    public set newUUID(value) {
        this._newUUID = value;
    }
}