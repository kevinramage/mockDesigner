import { Request, Response } from "express";

export class Context {

    private _request : Request;
    private _response : Response;
    private _variables : {[name: string]: any};

    constructor(request: Request, response: Response) {
        this._request = request;
        this._response = response;
        this._variables = {};
        this.updateRequestVariables();
    }

    private updateRequestVariables() {
        this.variables[".request.path"] = this.request.path;
        this.variables[".request.ip"] = this.request.ip;
        this.variables[".request.protocol"] = this.request.protocol;
        this.variables[".request.method"] = this.request.method;
        this.updateRequestQueryVariables();
        this.updateRequestParamsVariables();
        this.updateRequestHeadersVariables();
        this.updateRequestBodyVariables();
    }

    private updateRequestQueryVariables(){
        Object.keys(this.request.query).forEach((key) => {
            const value = this.request.query[key] as string;
            if (!Number.isNaN(Number.parseInt(value))) {
                this.variables[".request.query." + key] = Number.parseInt(value);
            } else if (value === "true") {
                this.variables[".request.query." + key] = true;
            } else if (value === "false") {
                this.variables[".request.query." + key] = false;
            } else {
                this.variables[".request.query." + key] = value;
            }
        });
    }

    private updateRequestParamsVariables(){
        Object.keys(this.request.params).forEach((key) => {
            const value = this.request.params[key];
            if (!Number.isNaN(Number.parseInt(value))) {
                this.variables[".request.params." + key] = Number.parseInt(value);
            } else if (value === "true") {
                this.variables[".request.params." + key] = true;
            } else if (value === "false") {
                this.variables[".request.params." + key] = false;
            } else {
                this.variables[".request.params." + key] = value;
            }
        });
    }

    private updateRequestHeadersVariables(){
        Object.keys(this.request.headers).forEach((key) => {
            this.variables[".request.headers." + key] = this.request.headers[key];
        });
    }

    private updateRequestBodyVariables(){
        this.updateObjectVariables(".request.body", this.request.body);
    }

    private updateObjectVariables(prefix: string, currentObj: any) {
        Object.keys(currentObj).forEach((key) => {
            const newObj = currentObj[key];
            if (typeof newObj === "object") {
                this.updateObjectVariables(prefix + "." + key, newObj);
            } else {
                this.variables[prefix + "." + key] = newObj;
            }
        });
    }

    public get request() {
        return this._request;
    }

    public get response() {
        return this._response;
    }

    public get variables() {
        return this._variables;
    }
}