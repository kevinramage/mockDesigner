import { NodeManager } from "../business/nodeManager";
import { Request, Response } from "express";
import * as winston from "winston";
import { ResponseUtils } from "./responseUtils";
import { ValidationError } from "../util/validationError";
import { ExecutionError } from "../util/executionError";

export class NodeController {

    public static createNode(req: Request, res: Response) {
        winston.debug("NodeController.createNode");
        const port = Number.parseInt(req.body.port);
        NodeManager.instance.createNewNode(req.body.name, port).then((node) => {
            ResponseUtils.sendCreatedResponse(res, node);
        }).catch((err) => {
            if ( err instanceof ValidationError) {
                winston.error("NodeController.createNode - Validation error: ", err);
                ResponseUtils.sendValidationError(res, err.message);
            } else {
                winston.error("NodeController.createNode - Internal error: ", err);
                ResponseUtils.sendInternalError(res);
            }
        });
    }

    public static deleteNode(req: Request, res: Response) {
        winston.debug("NodeController.deleteNode");
        NodeManager.instance.deleteNode(req.params.nodeName).then(() => {
            ResponseUtils.sendDeletedResponse(res);
        }).catch((err) => {
            winston.error("NodeController.deleteNode - Internal error: ", err);
            ResponseUtils.sendInternalError(res);
        });
    }

    public static updateCode(req: Request, res: Response) {
        winston.debug("NodeController.addService");
        NodeManager.instance.updateCode(req.params.nodeName, req.body.code).then(() => {
            ResponseUtils.sendSucceedResponse(res);
        }).catch((err) => {
            if ( err instanceof ExecutionError) {
                winston.error("NodeController.addService - execution error: ", err);
                ResponseUtils.sendValidationError(res, err.message);
            } else if ( err instanceof ValidationError) {
                winston.error("NodeController.addService - validation error: ", err);
                ResponseUtils.sendValidationError(res, err.message);
            } else {
                winston.error("NodeController.addService - Internal error: ", err);
                ResponseUtils.sendInternalError(res);
            }
        });
    }

    public static getAllNodes(req: Request, res: Response) {
        winston.debug("NodeController.getAllNodes");
        NodeManager.instance.getAllNodes().then((nodes) => {
            ResponseUtils.sendSucceedResponse(res, nodes);
        }).catch((err) => {
            winston.error("NodeController.getAllNodes - Internal error: ", err);
            ResponseUtils.sendInternalError(res);
        });
    }

    public static getNode(req: Request, res: Response) {
        winston.debug("NodeController.getNode");
        NodeManager.instance.getNode(req.params.nodeName).then((node) => {
            ResponseUtils.sendSucceedResponse(res, node);
        }).catch((err) => {
            if ( err instanceof ValidationError) {
                ResponseUtils.sendValidationError(res, err.message); 
            } else {
               winston.error("NodeController.getNode - Internal error: ", err);
                ResponseUtils.sendInternalError(res); 
            }
        });
    }
}