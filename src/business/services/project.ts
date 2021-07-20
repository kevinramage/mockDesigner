import { OptionsManager } from "../core/optionsManager";
import { Projects } from "../project/projects";
import { Request, Response } from "express";
import { Project } from "../project/project";
import { join } from "path";
import { FileUtils } from "business/utils/fileUtils";

export class ProjectService {
    
    public static getAllProjects(req: Request, res: Response) {
        Projects.buildProjects(OptionsManager.instance.mockWorkingDirectory).then((projects) => {
            res.status(200);
            res.setHeader("content-type", "application/json");
            const data = projects.map(p => { return p.toObject(); })
            res.send(JSON.stringify(data));
            res.end();
            
        }).catch((err) => {
            const data = { code: "500", message: "Internal error", error: err.message };
            if (OptionsManager.instance.debug) {
                data.error = err;
            }
            res.status(500);
            res.setHeader("content-type", "application/json");
            res.send(JSON.stringify(data));
            res.end();
        });
    }

    public static getProject(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const path = join(OptionsManager.instance.mockWorkingDirectory, projectName);
        Project.buildFromFile(path, projectName).then((project) => {
            if (project) {
                res.status(200);
                res.setHeader("content-type", "application/json");
                res.send(JSON.stringify(project.toObjectFull()));
                res.end();
            } else {
                res.status(404);
                res.setHeader("content-type", "application/json");
                res.send(JSON.stringify({code: 404, message: "Project not found", error: "Invalid project content"}));
                res.end();
            }
        }).catch((err) => {
            const data = { code: "500", message: "Internal error", error: err.message };
            if (OptionsManager.instance.debug) {
                data.error = err;
            }
            res.status(500);
            res.setHeader("content-type", "application/json");
            res.send(JSON.stringify(data));
            res.end();
        });
    }

    public static createProject(req: Request, res: Response) {
        const name = req.body.name || "";
        const method = req.body.method || "GET";
        const path = req.body.path || "/api/v1/" + name;

        // Create project
        Project.createProject(name, method, path).then((project) => {
            res.status(201);
            res.setHeader("content-type", "application/json");
            res.send(JSON.stringify(project.toObjectFull()));
            res.end();
            
        // Internal error
        }).catch((err) => {
            const data = { code: "500", message: "Internal error", error: err.message };
            if (OptionsManager.instance.debug) {
                data.error = err;
            }
            res.status(500);
            res.setHeader("content-type", "application/json");
            res.send(JSON.stringify(data));
            res.end();
        })
    }

    public static deleteProject(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        FileUtils.isFolderExists(join("mock", projectName)).then((existing) => {
            if (existing) {
                

            } else {
                const data = { code: "404", message: "Project not found " + projectName};
                res.status(404);
                res.setHeader("content-type", "application/json");
                res.send(JSON.stringify(data));
                res.end();
            }
        });
    }

    public static getProjectFile(req: Request, res: Response) {

    }
}