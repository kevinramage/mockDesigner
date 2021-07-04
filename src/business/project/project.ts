import { readFile } from "fs";
import { IProject } from "../../interface/project";
import { join } from "path";
import { format } from "util";
import { Service } from "./service";
import { parse } from "yaml";
import { ProjectFactory } from "../../factory/project";

export class Project {
    private _folderPath : string;
    private _name : string;
    private _services : { [ name: string] : Service };

    constructor() {
        this._folderPath = "";
        this._name = "";
        this._services = {};
    }

    public static buildFromFile(folderPath: string, folderName: string) {
        return new Promise<Project>((resolve, reject) => {
            const path = join(folderPath, "code", "main.yml");
            readFile(path, (err, data) => {
                if (!err) {
                    const project = Project.loadFromContent(data.toString(), folderPath);
                    project.folderName = folderName;
                    resolve(project);
                } else {
                    reject(err);
                }
            });
        });
    }

    public static loadFromContent(data: string, workspace: string) {
        const content = parse(data) as IProject;
        return ProjectFactory.build(content, workspace);
    }

    public addService(service: Service) {
        if (service && !this.isExistingService(service.name)) {
            this._services[service.name] = service;
        } else if (!service) {
            throw new Error("Invalid service, impossible to add null service to project");
        } else {
            throw new Error(format("Service '%s' already declared, impossible to add this service to the project", service.name));
        }
    }

    public isExistingService(serviceName: string) {
        return (!!this._services[serviceName]);
    }

    public toObject() {
        const keys = Object.keys(this.services);
        const services = keys.map(k => { return this.services[k].toObject() });
        return { name: this.folderName, applicationName: this.name, services: services};
    }

    public toObjectFull() {
        const keys = Object.keys(this.services);
        const services = keys.map(k => { return this.services[k].toObjectFull() });
        return { name: this.folderName, applicationName: this.name, services: services};
    }

    public get folderName() {
        return this._folderPath;
    }

    public set folderName(value) {
        this._folderPath = value;
    }

    public get name() {
        return this._name;
    }

    public set name(value) {
        if (value && value.trim() != "") {
            this._name = value;
        } else {
            throw new Error("Invalid project name");
        }
    }

    public get services() {
        return this._services;
    }
}