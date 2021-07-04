import { ObjectUtils } from "../utils/objectUtils";
import * as express from "express";
import { ResponseSent } from "./responseSent";

export class RequestReceived {

    private _protocol : string;
    private _httpVersion : string;
    private _hostName : string;
    private _method : string;
    private _path : string;
    private _query : {[key: string] : string | null};
    private _params : {[key: string] : string};
    private _headers : {[key: string] : string | null};
    private _body: string | null;
    private _ip : string;
    private _sentDate : Date;
    private _response : ResponseSent | null;

    constructor() {
        this._protocol = "";
        this._httpVersion = "";
        this._hostName = "";
        this._method = "";
        this._path = "";
        this._query = {};
        this._params = {};
        this._headers = {};
        this._body = null;
        this._ip = "";
        this._sentDate = new Date();
        this._response = null;
    }

    public getHash() {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const hash = await ObjectUtils.createHash(this.hashableRequest);
                resolve(hash);
            } catch (err) {
                reject(err);
            } 
        });   
    }

    public toJSON() {
        
        // Clone object
        const target : any = Object.assign({}, this);

        // Remove circular dependency
        if (target._response) {
            target._response._request = null;
        }

        return target;
    }

    public get protocol() {
        return this._protocol;
    }

    public set protocol(value) {
        this._protocol = value;
    }

    public get httpVersion() {
        return this._httpVersion;
    }

    public set httpVersion(value) {
        this._httpVersion = value;
    }

    public get hostName() {
        return this._hostName;
    }

    public set hostName(value) {
        this._hostName = value;
    }

    public get method() {
        return this._method;
    }

    public set method(value) {
        this._method = value;
    }

    public get path() {
        return this._path;
    }

    public set path(value) {
        this._path = value;
    }

    public get query() {
        return this._query;
    }

    public get params() {
        return this._params;
    }

    public get headers() {
        return this._headers;
    }

    public get body() {
        return this._body;
    }

    public set body(value) {
        this._body = value;
    }

    public get ip() {
        return this._ip;
    }

    public set ip(value) {
        this._ip = value;
    }

    public get sentDate() {
        return this._sentDate;
    }

    public get response() {
        return this._response;
    }

    public set response(value) {
        this._response = value;
    }

    public get hashableRequest() {
        const object = JSON.parse(JSON.stringify(this));
        object._sentDate = null;
        object._response = null;
        return object;
    }

    public static createFromExpress(request: express.Request) {
        const requestReceived = new RequestReceived();
        requestReceived.protocol = request.protocol;
        requestReceived.httpVersion = request.httpVersion;
        requestReceived.hostName = request.hostname;
        requestReceived.method = request.method;
        requestReceived.path = request.path;
        Object.entries(request.query).forEach((values) => {
            const value = values[1]?.toString() || null;
            requestReceived.query[values[0]] = value;
        });
        Object.entries(request.params).forEach((values) => {
            requestReceived.params[values[0]] = values[1];
        });
        Object.entries(request.headers).forEach((values) => {
            const value = values[1]?.toString() || null;
            requestReceived.headers[values[0]] = value;
        });
        requestReceived.body = request.body as string || null;
        requestReceived.ip = request.ip;

        return requestReceived;
    }
}