import { format } from "util";
import { DictionnaryUtils } from "../utils/dictionnaryUtils";
import { Project } from "../project/project";

export class ProjectManager {
    private static _instance: ProjectManager;
    private _projects : {[key: string] : Project}

    private constructor() {
        this._projects = {};
    }

    public addProject(project: Project) {
        const keys = Object.keys(this._projects);
        if (!keys.find(p => { return p == project.name })) {
            this._projects[project.name] = project;
        } else {
            const names = keys.join(", ");
            throw new Error(format("The project name is not unique. These projects name '%s' are already used",names));
        }
    }

    public removeProject(projectName: string) {
        this._projects = DictionnaryUtils.removeElement(projectName, this._projects);
    }

    public getAllProjects() {
        return Object.values(this._projects);
    }

    public getProject(name: string) {
        return this._projects[name];
    }

    public getService(projectName: string, serviceName: string) {
        const project = this.getProject(projectName);
        if (project) {
            const entry = Object.entries(project.services).find(e => { return e[1].name == serviceName; });
            if (entry) {
                return entry[1];
            }
        } 
        return undefined;
    }

    public static get instance() {
        if (!ProjectManager._instance) {
            ProjectManager._instance = new ProjectManager();
        }
        return ProjectManager._instance;
    }
}