import { join } from "path";
import { access, readdir } from "fs";
import * as winston from "winston";
import { DataManager } from "../core/dataManager";
import { Context } from "../core/context";
import { METHODS } from "../utils/enum";
import { Authentication } from "./authentication";
import { Response } from "./response";
import { FunctionManager } from "../core/functionManager";
import { Project } from "./project";
import { OptionsManager } from "../core/optionsManager";
import { RouteManager } from "../core/routeManager";
import { IAuthentication } from "../../interface/authentication";
import { AuthenticationFactory } from "../../factory/authentication";
import { ResourceNotFoundError } from "../utils/common";
import { DictionnaryUtils } from "../utils/dictionnaryUtils";

export class Service {
    private _workspace : string;
    private _name : string;
    private _method : string;
    private _path : string;
    private _response : Response;
    private _authentication : Authentication | null;
    private _dataManager : DataManager;
    private _functionManager : FunctionManager;

    constructor(workspace: string) {
        this._workspace = workspace;
        this._name = "";
        this._method = METHODS.GET;
        this._path = "/";
        this._authentication = null;
        this._response = new Response();

        this._dataManager = new DataManager();
        this.updateDataManager(workspace);
        this._functionManager = new FunctionManager();
        this.updateFunctionManager(workspace);
    }

    public execute(context: Context) {
        winston.debug("Service.execute - Execute service: " + this.method + " " + this.path);
        return new Promise<void>(async (resolve, reject) => {
            context.dataManager = this._dataManager;
            context.functionManager = this._functionManager;
            if (!this.authentication || this.authentication.authenticate(context)) {
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

    public static getService(project: Project, name: string) {
        return project.services[name];
    }

    public static createService(project: Project, name: string, method: string, path: string, authentication: IAuthentication) {

        // Check service name available
        Service.checkServiceNameAvailable(project, name);

        // Create service        
        const workspace = join(OptionsManager.instance.mockWorkingDirectory, project.folderName);
        const service = new Service(workspace);
        service.name = name;
        service.method = method;
        service.path = path;
        if (authentication) {
            service.authentication = AuthenticationFactory.build(authentication);
        }

        // Add service to project
        project.addService(service);

        // Add route
        RouteManager.instance.addListener(service);

        return service;
    }

    public static updateService(project: Project, name: string, method: string, path: string, authentication: IAuthentication) {

        // Delete existing service
        Service.deleteService(project, name);

        // Create new service
        return Service.createService(project, name, method, path, authentication);
    }

    public static deleteService(project: Project, name: string) {

        // Identify service
        const service = project.services[name];
        if (service) {

            // Remove service from project
            project.services = DictionnaryUtils.removeElement(name, project.services);

            // Remove route
            RouteManager.instance.removeListener(service);

        } else {
            throw new ResourceNotFoundError("Service not found");
        }
    }

    private static checkServiceNameAvailable(project: Project, serviceName: string) {
        const serviceExisting = Object.keys(project.services).find(x => { return x == serviceName; });
        if (serviceExisting) {
            throw new Error("Invalid service name");
        }
    }

    public toObject() {
        return {
            name: this.name,
            method: this.method,
            path: this.path,
            workspace: this.workspace
        }
    }

    public toObjectFull() {
        return {
            name: this.name,
            method: this.method,
            path: this.path,
            authentication: this.authentication ? this.authentication.toObject() : null,
            response: this.response.toObject()
        }
    }

    public toCode() {

        // Base
        let result : any = {
            name: this.name,
            method: this.method,
            path: this.path,
            response: this.response.toCode()
        };

        // Authentication
        if (this.authentication) {
            result.authentication = this.authentication.toCode();
        }

        return result;
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