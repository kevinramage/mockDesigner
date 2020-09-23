import { Response } from "./response";
import { HTTP_METHODS } from "../constantes";
import { Check } from "./check";

export class Service {
    private _name : string;
    private _method : string;
    private _path : string | undefined;
    private _businessObject : string | undefined;
    private _microserviceAction : string | undefined;
    private _endWithVariable : boolean;
    private _responses : Response[];
    private _checks : Check[];

    constructor() {
        this._name = "";
        this._method = "GET";
        this._responses = [];
        this._endWithVariable = false;
        this._checks = [];
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

    public addCheck(check: Check) {
        this._checks.push(check);
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

    public get responses() {
        return this._responses;
    }

    public set responses(value) {
        this._responses = value;
    }

    public get defaultResponse() {
        if ( this._responses.length > 0 ) {
            if ( this._responses.length > 1 ) {
                const searchResponse = this._responses.find(res => {
                    return res.code.toString().startsWith("2");
                });
                return searchResponse ? searchResponse : this.responses[0];
            } else {
                return this._responses[0];
            }
        } else {
            return null;
        }
    }

    public get errorsResponse() {
        const responses : Response[] = [];
        const defaultResponse = this.defaultResponse;
        this._responses.forEach(res => {
            if ( res.uuid != defaultResponse?.uuid && !res.code.toString().startsWith("2")) {
                responses.push(res);
            }
        });
        return responses;
    }

    public get validationErrorResponse() {
        const defaultResponse = this.defaultResponse;
        const validationErrorsResponse = this.responses.filter(res => { 
            return res.code.toString().startsWith("4") && res.uuid != defaultResponse?.uuid;
        });
        if ( validationErrorsResponse.length > 0 ) {
            const badRequestError = validationErrorsResponse.find(res => { return res.code == 400; });
            const methodNotAllowError = validationErrorsResponse.find(res => { return res.code == 405; });
            if ( badRequestError ) {
                return badRequestError;
            } else if ( methodNotAllowError ) {
                return methodNotAllowError;
            } else {
                return validationErrorsResponse[0];
            }
        } else {
            return null;
        }
    }

    public get checks() {
        return this._checks;
    }

    public set checks(value) {
        this._checks = value;
    }
}