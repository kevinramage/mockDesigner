import { Request } from "express";

export class Context {
    private _request : Request | undefined;
    private _dataSources : {[key: string] : object};
    private _data : object;

    constructor(request ?: Request) {
        this._request = request;
        this._dataSources = {};
        this._data = {
            increment: {}
        }
    }

    public get request() {
        return this._request;
    }
    public set request(value) {
        this._request = value;
    }
    
    public get data() {
        return this._data;
    }
    public set data(value) {
        this._data = value;
    }

    public get dataSources() {
        return this._dataSources;
    }

    public get isXMLRequest() {
        if ( this._request && this._request.headers ) {
            return this._request.headers["content-type"]?.includes("text/xml") || this._request.headers["content-type"]?.includes("application/xml");
        } else {
            return false;
        }
    }

    public get isJSONRequest() {
        if ( this._request && this._request.headers ) {
            return this._request.headers["content-type"]?.includes("application/json");
        } else {
            return false;
        }
    }
}