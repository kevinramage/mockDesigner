import { ProjectManager } from "../core/projectManager";
import { Request, Response } from "express";
import { ServiceBase } from "./base";
import { TriggerOperation } from "../project/triggerOperation";

export class TriggerService extends ServiceBase {

    public static async getAllTriggers(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const serviceName = req.params.svcname || "";

        try {
            const service = ProjectManager.instance.getService(projectName, serviceName);
            if (service) {
                TriggerService.sendData(res, service.response.triggers);
            } else {
                TriggerService.sendResourceNotFound(res, "Project or service");
            }
        } catch (err) {
            TriggerService.sendInternalError(res, err);
        }
    }

    public static async getTrigger(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const serviceName = req.params.svcname || "";
        const triggerId = req.params.trgid || "";

        try {
            const service = ProjectManager.instance.getService(projectName, serviceName);
            if (service) {
                const index = Number.parseInt(triggerId);
                if (index > 0 && index < service.response.triggers.length) {
                    TriggerService.sendData(res, service.response.triggers[index]);
                } else {
                    TriggerService.sendResourceNotFound(res, "Trigger");
                }
            } else {
                TriggerService.sendResourceNotFound(res, "Project or service");
            }
        } catch (err) {
            TriggerService.sendInternalError(res, err);
        }
    }

    public static async createTrigger(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const serviceName = req.params.svcname || "";
        const type = req.body.type || "";
        try {
            const project = ProjectManager.instance.getProject(projectName);
            const service = ProjectManager.instance.getService(projectName, serviceName);
            if (project && service) {
                TriggerOperation.createTrigger(project, service, type).then(trigger => {
                    TriggerService.sendDataCreated(res, trigger);
                }).catch(err => {
                    TriggerService.sendInternalError(res, err);
                });
                
            } else {
                TriggerService.sendResourceNotFound(res, "Project or service");
            }
        } catch (err) {
            TriggerService.sendInternalError(res, err);
        }
    }

    public static async deleteTrigger(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const serviceName = req.params.svcname || "";
        const triggerId = req.params.trgid || "";
        try {
            const project = ProjectManager.instance.getProject(projectName);
            const service = ProjectManager.instance.getService(projectName, serviceName);
            if (project && service) {
                TriggerOperation.deleteTrigger(project, service, Number.parseInt(triggerId)).then(() => {
                    TriggerService.sendOperationComplete(res);
                }).catch((err) => {
                    TriggerService.sendInternalError(res, err);
                });

            } else {
                TriggerService.sendResourceNotFound(res, "Project or service");
            }
        } catch (err) {
            TriggerService.sendInternalError(res, err);
        }
    }
}