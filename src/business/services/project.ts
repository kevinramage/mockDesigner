import { OptionsManager } from "../core/optionsManager";
import { Projects } from "../project/projects";
import { Request, Response } from "express";
import { Project } from "../project/project";
import { join } from "path";

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
}