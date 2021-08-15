import { ProjectManager } from "../core/projectManager";
import { Request, Response } from "express";
import { ServiceBase } from "./base";
import { ActionOperation } from "../project/actionOperation";
import { IAction } from "../../interface/action";

export class ActionService extends ServiceBase {

    public static async getAllActions(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const serviceName = req.params.svcname || "";
        const triggerIdParam = req.params.trgid || "";
        const triggerId = Number.parseInt(triggerIdParam);

        try {
            const service = ProjectManager.instance.getService(projectName, serviceName);
            if (service) {
                if (triggerId >= 0 && triggerId < service.response.triggers.length) {
                    ActionService.sendData(res, service.response.triggers[triggerId].actions);
                } else {
                    ActionService.sendResourceNotFound(res, "Trigger");
                }
            } else {
                ActionService.sendResourceNotFound(res, "Project or service");
            }
        } catch (err) {
            ActionService.sendInternalError(res, err);
        }
    }

    public static async getAction(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const serviceName = req.params.svcname || "";
        const triggerIdParam = req.params.trgid || "";
        const triggerId = Number.parseInt(triggerIdParam);
        const actionIdParam = req.params.actid || "";
        const actionId = Number.parseInt(actionIdParam);

        try {
            const service = ProjectManager.instance.getService(projectName, serviceName);
            if (service) {
                if (triggerId >= 0 && triggerId < service.response.triggers.length) {
                    if (actionId >= 0 && actionId < service.response.triggers[triggerId].actions.length) {
                        ActionService.sendData(res, service.response.triggers[triggerId].actions[actionId]);
                    } else {
                        ActionService.sendResourceNotFound(res, "Action");
                    }
                } else {
                    ActionService.sendResourceNotFound(res, "Trigger");
                }
            } else {
                ActionService.sendResourceNotFound(res, "Project or service");
            }
        } catch (err) {
            ActionService.sendInternalError(res, err);
        }
    }

    public static async createAction(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const serviceName = req.params.svcname || "";
        const triggerIdParam = req.params.trgid || "";
        const triggerId = Number.parseInt(triggerIdParam);
        const data = req.body as IAction;

        try {
            const project = ProjectManager.instance.getProject(projectName);
            const service = ProjectManager.instance.getService(projectName, serviceName);
            if (service) {
                if (triggerId >= 0 && triggerId < service.response.triggers.length) {
                    ActionOperation.createAction(project, service.response.triggers[triggerId], data).then(action => {
                        ActionService.sendData(res, action);
                    }).catch((err) => {
                        ActionService.sendInternalError(res, err);
                    });
                } else {
                    ActionService.sendResourceNotFound(res, "Trigger");
                }
            } else {
                ActionService.sendResourceNotFound(res, "Project or service");
            }
        } catch (err) {
            ActionService.sendInternalError(res, err);
        }
    }

    public static async deleteAction(req: Request, res: Response) {
        const projectName = req.params.pjname || "";
        const serviceName = req.params.svcname || "";
        const triggerIdParam = req.params.trgid || "";
        const triggerId = Number.parseInt(triggerIdParam);
        const actionIdParam = req.params.actid || "";
        const actionId = Number.parseInt(actionIdParam);

        try {
            const project = ProjectManager.instance.getProject(projectName);
            const service = ProjectManager.instance.getService(projectName, serviceName);
            if (service) {
                if (triggerId >= 0 && triggerId < service.response.triggers.length) {
                    ActionOperation.deleteAction(project, service.response.triggers[triggerId], actionId).then(() => {
                        ActionService.sendOperationComplete(res);
                    }).catch(err => {
                        ActionService.sendInternalError(res, err);
                    });
                } else {
                    ActionService.sendResourceNotFound(res, "Trigger");
                }
            } else {
                ActionService.sendResourceNotFound(res, "Project or service");
            }
        } catch (err) {
            ActionService.sendInternalError(res, err);
        }
    }
}