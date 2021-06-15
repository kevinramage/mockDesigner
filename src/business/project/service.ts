import { Context } from "../core/context";
import { METHODS } from "../utils/enum";
import { Authentication } from "./authentication";
import { Response } from "./response";

export class Service {
    private _name : string;
    private _method : string;
    private _path : string;
    private _response : Response;
    private _authentication : Authentication;

    constructor() {
        this._name = "";
        this._method = METHODS.GET;
        this._path = "/";
        this._authentication = new Authentication();
        this._response = new Response();
    }

    public execute(context: Context) {
        if (this.authentication.authenticate(context)) {
            this.response.execute(context);
        }
    }

    public get name() {
        return this._name;
    }

    public set name(value) {
        if (value && value.trim() != "") {
            this._name = value;
        } else {
            throw new Error("Invalid service name");
        }
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

    public get response() {
        return this._response;
    }

    public set response(value) {
        this._response = value;
    }

    public get authentication() {
        return this._authentication;
    }

    public set authentication(value) {
        this._authentication = value;
    }
}