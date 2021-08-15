import { Request, Response } from "express";
import { BehaviourManager } from "../core/behaviourManager";
import { ServiceBase } from "./base";

export class BehaviourService extends ServiceBase {

    public static getBehaviours(req: Request, res: Response) {
        const name = req.params.name;
        console.info(req.params);
        BehaviourManager.instance.getBehaviours(name).then((value) => {
            BehaviourService.sendData(res, value);
        }).catch((err: Error) => {
            BehaviourService.sendInternalError(res, err);
        });
    }

    public static getBehaviour(req: Request, res: Response) {
        const name = req.params.name;
        const code = req.params.code;
        BehaviourManager.instance.getBehaviour(name, code).then((value) => {
            if (value) {
                BehaviourService.sendData(res, value);
            } else {
                BehaviourService.sendResourceNotFound(res, "Behaviour");
            }
        }).catch((err: Error) => {
            BehaviourService.sendInternalError(res, err);
        });
    }

    public static createBehaviour(req: Request, res: Response) {
        const name = req.body.name;
        const code = req.body.code;
        BehaviourManager.instance.createBehaviour(name, code).then((value) => {
            BehaviourService.sendOperationComplete(res);
        }).catch((err: Error) => {
            BehaviourService.sendInternalError(res, err);
        });
    }

    public static deleteBehaviour(req: Request, res: Response) {
        const name = req.params.name;
        const code = req.params.code;
        BehaviourManager.instance.deleteBehaviour(name, code).then((value) => {
            if (value) {
                BehaviourService.sendOperationComplete(res);
            } else {
                BehaviourService.sendResourceNotFound(res, "Behaviour");
            }
        }).catch((err: Error) => {
            BehaviourService.sendInternalError(res, err);
        });
    }
}