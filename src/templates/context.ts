import { Request } from "express";

export class Context {
    private _serviceName : string;
    private _requestStorageKeys : string[];
    private _requestStorageExpiration : number;
    private _request : Request | undefined;
    private _dataSources : {[key: string] : object};
    private _data : object;
    private _messages : string[];

    constructor(request ?: Request) {
        this._serviceName = "";
        this._requestStorageExpiration = 0;
        this._requestStorageKeys = [];
        this._request = request;
        this._dataSources = {};
        this._data = {
            increment: {}
        };
        this._messages = [];
    }

    public addMessage(message: string) {
        this._messages.push(message);
    }

    public addRequestStorageKey(key: string) {
        this._requestStorageKeys.push(key);
    }

    public get request() {
        return this._request as Request;
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

    public get messages() {
        return this._messages;
    }

    public get serviceName() {
        return this._serviceName;
    }

    public set serviceName(value) {
        this._serviceName = value;
    }

    public get requestStorageKeys() {
        return this._requestStorageKeys;
    }

    public get requestStorageExpiration() {
        return this._requestStorageExpiration;
    }

    public set requestStorageExpiration(value) {
        this._requestStorageExpiration = value;
    }
}