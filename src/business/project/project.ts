import * as winston from "winston";
import { stringify } from "yaml";
import { readdir, readFile, readFileSync } from "fs";
import { IProject } from "../../interface/project";
import { join } from "path";
import { format } from "util";
import { Service } from "./service";
import { parse } from "yaml";
import { ProjectFactory } from "../../factory/project";
import { ProjectFile } from "./projectFile";
import { lstat } from "fs/promises";
import { FileUtils } from "../utils/fileUtils";
import { ProjectManager } from "../core/projectManager";
import { OptionsManager } from "../core/optionsManager";

export class Project {
    private _folderPath : string;
    private _name : string;
    private _files : ProjectFile[];
    private _services : { [ name: string] : Service };

    constructor() {
        this._folderPath = "";
        this._name = "";
        this._services = {};
        this._files = [];
    }

    private readData(data: Buffer, folder: string) {
        let content = data.toString();
        const regex = /(?<space> *)##INCLUDE\s*(?<filename>[0-9a-zA-Z|\.]+)\s*##/g;
        let match = regex.exec(content);
        while (match) {
            if (match.groups && match.groups.filename) {
                const path = join(folder, "code", match.groups.filename);
                const space = match.groups.space || "";
                const buffer = readFileSync(path);
                const contentToInclude = space + buffer.toString().replace(/\n/g, "\n" + space);
                content = content.replace(match[0], contentToInclude);
            }
            match = regex.exec(content);
        }
        return content;
    }

    private readFiles(workspace: string) {
        return new Promise<void>((resolve, reject) => {
            this.readDirectories(workspace).then((projectFiles) => {
                for (var i = 0; i < projectFiles.length; i++) {
                    projectFiles[i].id = i+1;
                    this.addProjectFile(projectFiles[i]);
                }
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    private readDirectories(dirPath: string) {
        return new Promise<ProjectFile[]>((resolve, reject) => {
            readdir(dirPath, (err, files) => {
                if (!err) {
                    const promises = files.map(f => {
                        const path = join(dirPath, f);
                        return this.readDirectory(path);
                    });

                    Promise.all(promises).then((files) => {
                        const projectFiles = files.reduce((a, b) => {
                            return a.concat(b);
                        }, []);
                        resolve(projectFiles);
                    }).catch((err) => {
                        reject(err);
                    });
                                 
                } else {
                    reject(err);
                }
            });
        });
    }

    private readDirectory(file: string) {
        return new Promise<ProjectFile[]>((resolve, reject) => {
            lstat(file).then((stat) => {
                if (stat.isDirectory()) {
                    this.readDirectories(file).then((files => {
                        resolve(files);
                    })).catch((err) => {
                        reject(err);
                    });
                } else {
                    readFile(file, (err,data) => {
                        if (!err) {
                            const projectFile = new ProjectFile(file, data.toString());
                            resolve([projectFile]);
                        } else {
                            winston.error("Project.readDirectory - Error during readFile of file: " + file, err);
                            reject(err);
                        }
                    });
                }
            }).catch((err) => {
                winston.error("Project.readDirectory - Error during lstat of file: " + file, err);
                reject(err);
            });
        });
    }

    public save() {
        return new Promise<void>(async(resolve, reject) => {
            
            try {

                // Create directories
                const mockDirectory = OptionsManager.instance.mockWorkingDirectory;
                await FileUtils.updateFolder(mockDirectory);
                await FileUtils.updateFolder(join(mockDirectory, this.folderName));
                await FileUtils.updateFolder(join(mockDirectory, this.folderName, "code"));
                await FileUtils.updateFolder(join(mockDirectory, this.folderName, "data"));
                await FileUtils.updateFolder(join(mockDirectory, this.folderName, "responses"));
                await FileUtils.updateFolder(join(mockDirectory, this.folderName, "functions"));

                // Save code file
                const path = join(mockDirectory, this.folderName, "code", "main.yml");
                const projectFile = this.files.find(f => { return f.name == path; });
                if (projectFile) {
                    projectFile.content = stringify(this.toCode());
                }

                // Save project files
                for (var index in this.files) {
                    await this.files[index].save();
                }

                resolve();

            } catch (err) {
                reject(err);
            }
        });
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

    public addProjectFile(projectFile: ProjectFile) {
        this._files.push(projectFile);
    }

    public isExistingService(serviceName: string) {
        return (!!this._services[serviceName]);
    }

    public toObject() {
        return { name: this.folderName, applicationName: this.name };
    }

    public toObjectFull() {

        // Services
        const keys = Object.keys(this.services);
        const services = keys.map(k => { return this.services[k].toObjectFull() });

        // Files
        const keysFiles = Object.keys(this._files);
        const files = keysFiles.map(k => { return this._files[keysFiles[k]].toObject() });
        return { name: this.folderName, applicationName: this.name, services: services, files: files};
    }

    public toCode() {
        return {
            name: this.name,
            services: Object.values(this.services).map(s => { return s.toCode(); })
        }
    }


    public static buildFromFile(folderPath: string, folderName: string) {
        return new Promise<Project|null>((resolve, reject) => {
            const path = join(folderPath, "code", "main.yml");
            readFile(path, async(err, data) => {
                if (!err) {
                    const project = await Project.loadFromContent(data, folderPath);
                    if (project) {
                        project.folderName = folderName;
                    }
                    resolve(project);
                } else if (err.message.startsWith("ENOENT: no such file or directory")) {
                    winston.warn(format("Project.buildFromFile - Project '%s' ignored because code not found (code/main.yml)", folderName))
                    resolve(null);
                } else {
                    reject(err);
                }
            });
        });
    }
    
    public static loadFromContent(buffer: Buffer, workspace: string) {
        return new Promise<Project|null>(async(resolve) => {
            try {

                // Create project
                const project = new Project();

                // Read content
                const data = project.readData(buffer, workspace);

                // Build project
                const content = parse(data, { prettyErrors: true}) as IProject;
                ProjectFactory.build(project, content, workspace);

                // Read files (async)
                await project.readFiles(workspace);

                resolve(project);

            } catch (err) {
                winston.error("Project.loadFromContent - Error during project loading: ", err);
                resolve(null);
            }
        });
    }

    public static getProject(name: string) {
        return new Promise<Project>(async (resolve) => {
            resolve(ProjectManager.instance.getProject(name));
        });
    }

    public static createProject(name: string) {

        return new Promise<Project>(async (resolve, reject) => {
            try {
                // Create project
                const project = new Project();
                project.name = name;
                project.folderName = name;

                // Create code file
                const mockDirectory = OptionsManager.instance.mockWorkingDirectory;
                const path = join(mockDirectory, name, "code", "main.yml");
                const projectFile = new ProjectFile(path, "");
                project.addProjectFile(projectFile);

                // Add project
                ProjectManager.instance.addProject(project);

                // Save
                await project.save();

                resolve(project);

            } catch (err) {
                //winston.error("Project.createProject - Internal error occured: ", err);
                reject(err);
            }
        });
    }

    public static deleteProject(name: string) {
        return new Promise<void>(async (resolve, reject) => {
            try {

                // Delete project
                ProjectManager.instance.removeProject(name);

                // Delete folder
                const mockDirectory = OptionsManager.instance.mockWorkingDirectory;
                const path = join(mockDirectory, name);
                const folderExists = await FileUtils.isFolderExists(path);
                if (folderExists) {
                    await FileUtils.deleteFolder(path);
                }

                resolve()

            } catch (err) {
                winston.error("Project.deleteProject - Internal error occured: ", err);
                reject(err);
            }
        });
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

    public set services(value) {
        this._services = value;
    }

    public get files() {
        return this._files;
    }
}