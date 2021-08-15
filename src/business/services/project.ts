import { Request, Response } from "express";
import { Project } from "../project/project";
import { ProjectManager } from "../core/projectManager";
import { ServiceBase } from "./base";

export class ProjectService extends ServiceBase {
    
    public static getAllProjects(req: Request, res: Response) {
        const projects = ProjectManager.instance.getAllProjects();
        const data = projects.map(p => { return p.toObject(); })
        ProjectService.sendData(res, data);
    }

    public static getProject(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        
        // Get project
        Project.getProject(projectName).then((project) => {
            if (project) {
                ProjectService.sendData(res, project.toObjectFull());
            } else {
                ProjectService.sendResourceNotFound(res, "Project");
            }
            
        // Internal error
        }).catch((err: Error) => {
            ProjectService.sendInternalError(res, err);
        });
    }

    public static createProject(req: Request, res: Response) {
        const name = req.body.name || "";

        // Create project
        Project.createProject(name).then((project) => {
            ProjectService.sendDataCreated(res, project.toObjectFull());
            
        // Internal error
        }).catch((err: Error) => {
            ProjectService.sendInternalError(res, err);
        });
    }

    public static deleteProject(req: Request, res: Response) {
        const projectName = req.params.pjname || "";

        // Delete project
        Project.deleteProject(projectName).then(() => {
            ProjectService.sendOperationComplete(res);
            
        // Internal error
        }).catch((err) => {
            ProjectService.sendInternalError(res, err);
        })
    }
}