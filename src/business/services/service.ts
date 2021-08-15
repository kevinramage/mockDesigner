import { ProjectManager } from "../core/projectManager";
import { Request, Response } from "express";
import { ServiceBase } from "./base";
import { Service } from "../project/service";
import { ResourceNotFoundError } from "../utils/common";

export class ServiceWrapper extends ServiceBase {
    
    public static getAllServices(req: Request, res: Response) {
        const projectName = req.params.pjname || "";

        try {
            const project = ProjectManager.instance.getProject(projectName);
            if (project) {
                ServiceWrapper.sendData(res, Object.values(project.services));
            } else {
                ServiceWrapper.sendResourceNotFound(res, "Project");
            }
        } catch (err) {
            ServiceWrapper.sendInternalError(res, err);
        }
    }

    public static getService(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const serviceName = req.params.svcname || "";
        try {
            const service = ProjectManager.instance.getService(projectName, serviceName);
            if (service) {
                ServiceWrapper.sendData(res, service);
            } else {
                ServiceWrapper.sendResourceNotFound(res, "Project or service");
            }
        } catch (err) {
            ServiceWrapper.sendInternalError(res, err);
        }
    }

    public static async createService(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const name = req.body.name || "";
        const method = req.body.method || "";
        const path = req.body.path || "";
        const authentication = req.body.authentication || null;

        try {

            // Get project
            const project = ProjectManager.instance.getProject(projectName);

            // Create service
            const newService = Service.createService(project, name, method, path, authentication);

            // Save project
            await project.save();

            ServiceWrapper.sendDataCreated(res, newService);

        } catch (err) {
            ServiceWrapper.sendInternalError(res, err);
        }
    }

    public static async updateService(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const name = req.body.name || "";
        const method = req.body.method || "";
        const path = req.body.path || "";
        const authentication = req.body.authentication || null;

        try {

            // Get project
            const project = ProjectManager.instance.getProject(projectName);

            // Update service
            const updatedService = Service.updateService(project, name, method, path, authentication);

            // Save project
            await project.save();

            ServiceWrapper.sendData(res, updatedService);

        } catch (err) {
            ServiceWrapper.sendInternalError(res, err);
        }
    }

    public static async deleteService(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const serviceName = req.params.svcname || "";

        try {

            // Get project
            const project = ProjectManager.instance.getProject(projectName);

            // Create service
            Service.deleteService(project, serviceName);

            // Save project
            await project.save();

            ServiceWrapper.sendOperationComplete(res);

        } catch (err) {
            if (err instanceof ResourceNotFoundError) {
                ServiceWrapper.sendResourceNotFound(res, "Service");
            } else {
                ServiceWrapper.sendInternalError(res, err);
            }
        }
    }
}