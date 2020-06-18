import { Response } from "./response";
import { HTTP_METHODS } from "../constantes";

export class Service {
    private _name : string;
    private _method : string;
    private _path : string | undefined;
    private _businessObject : string | undefined;
    private _microserviceAction : string | undefined;
    private _endWithVariable : boolean;
    private _responses : Response[];
    private _mandatoryHeaders : string[];

    constructor() {
        this._name = "";
        this._method = "GET";
        this._mandatoryHeaders = [];
        this._responses = [];
        this._endWithVariable = false;
    }

    public addMandatoryHeader(header: string) {
        this._mandatoryHeaders.push(header);
    }

    public addResponse(response: Response) {
        this._responses.push(response);
    }

    public identifyMicroservice() {
        switch ( this.method ) {
            case HTTP_METHODS.GET:
                this._microserviceAction = this.endWithVariable ? "get" : "getall";
            break;
            case HTTP_METHODS.POST:
                this._microserviceAction = "create";
            break;
            case HTTP_METHODS.PUT:
                this._microserviceAction = "update";
            break;
            case HTTP_METHODS.PATCH:
                this._microserviceAction = "delta";
            break;
            case HTTP_METHODS.DELETE:
                this._microserviceAction = this.endWithVariable ? "delete" : "deleteall";
            break;
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

    public get businessObject() {
        return this._businessObject;
    }
    public set businessObject(value) {
        this._businessObject = value;
    }

    public get endWithVariable() {
        return this._endWithVariable;
    }
    public set endWithVariable(value) {
        this._endWithVariable = value;
    }

    public get name() {
        return this._name;
    }
    public set name(value) {
        this._name = value;
    }

    public get microserviceAction() {
        return this._microserviceAction;
    }

    public get defaultService() {
        if ( this._responses.length > 0 ) {
            if ( this._responses.length > 1 ) {
                const searchResponse = this._responses.find(res => {
                    return res.code.toString().startsWith("2");
                });
                return searchResponse ? searchResponse : null;
            } else {
                return this._responses[0];
            }
        } else {
            return null;
        }
    }
}