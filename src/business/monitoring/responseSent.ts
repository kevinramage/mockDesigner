import { RequestReceived } from "./requestReceived";

export class ResponseSent {

    private _statusCode: number;
    private _headers: {[key: string] : string | null };
    private _body: string | null;
    private _sentDate : Date;
    private _request : RequestReceived | null;

    constructor() {
        this._statusCode = 0;
        this._headers = {};
        this._body = null;
        this._sentDate = new Date();
        this._request = null;
    }

    public toJSON() {
        
        // Clone object
        const target : any = Object.assign({}, this);

        // Remove circular dependency
        if (target._request) {
            target._request._response = null;
        }

        return target;
    }

    public get statusCode() {
        return this._statusCode;
    }
    public set statusCode(value) {
        this._statusCode = value;
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

    public get sentDate() {
        return this._sentDate;
    }

    public get request() {
        return this._request;
    }

    public set request(value) {
        this._request = value;
    }

    public static create(statusCode: number, headers: {[key: string]: string | null}, body: string | null) {
        const responseSent = new ResponseSent();
        responseSent.statusCode = statusCode;
        responseSent._headers = headers;
        responseSent.body = body;
        return responseSent;
    }
}