import { DataManager } from "../core/dataManager";
import { Context } from "../core/context";
import { METHODS } from "../utils/enum";
import { Authentication } from "./authentication";
import { Response } from "./response";
import { join } from "path";
import { access, exists, existsSync, fstat, readdir } from "fs";
import { FunctionManager } from "../core/functionManager";

export class Service {
    private _workspace : string;
    private _name : string;
    private _method : string;
    private _path : string;
    private _response : Response;
    private _authentication : Authentication;
    private _dataManager : DataManager;
    private _functionManager : FunctionManager;

    constructor(workspace: string) {
        this._workspace = workspace;
        this._name = "";
        this._method = METHODS.GET;
        this._path = "/";
        this._authentication = new Authentication();
        this._response = new Response();

        this._dataManager = new DataManager();
        this.updateDataManager(workspace);
        this._functionManager = new FunctionManager();
        this.updateFunctionManager(workspace);
    }

    public execute(context: Context) {
        return new Promise<void>(async (resolve, reject) => {
            context.dataManager = this._dataManager;
            context.functionManager = this._functionManager;
            if (this.authentication.authenticate(context)) {
                this.response.execute(context, this.name).then(resolve).catch(reject);
            } else {
                resolve();
            }
        });
    }

    public updateDataManager(workspace: string) {
        return new Promise<void>((resolve) =>  {
            const path = join(workspace, "data");
            access(path, (err) => {
                if (!err) {
                    readdir(path, (err, files) => {
                        if (!err) {
                            const dataSources = files.filter(f => { return f.endsWith(".json") })
                                .map(f => { return f.substr(0, f.length - (".json").length); });
                            dataSources.forEach(d => {
                                this._dataManager.registerDataSource(d, workspace);
                            });
                        } else {
                            resolve();
                        }
                    });
                } else {
                    resolve()
                }
            });
        });
    }

    public updateFunctionManager(workspace: string) {
        return new Promise<void>((resolve) =>  {
            const path = join(workspace, "functions");
            access(path, (err) => {
                if (!err) {
                    readdir(path, (err, files) => {
                        if (!err) {
                            const functions = files.filter(f => { return f.endsWith(".js") })
                                .map(f => { return f.substr(0, f.length - (".js").length); });
                            functions.forEach(f => {
                                this._functionManager.registerFunction(f, workspace);
                            });
                        } else {
                            resolve();
                        }
                    });
                } else {
                    resolve()
                }
            });
        });
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

    public get workspace() {
        return this._workspace;
    }
}