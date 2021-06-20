import { Request, Response } from "express";
import { BehaviourManager } from "./business/core/behaviourManager";

export class BehaviourService {

    public static getBehaviours(req: Request, res: Response) {
        const name = req.params.name;
        console.info(req.params);
        BehaviourManager.instance.getBehaviours(name).then((value) => {
            res.status(200);
            const object = { message: "Operation complete", data: value};
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(object));
            res.end();
        }).catch((err: Error) => {
            res.status(500);
            const object = { error: "Internal error", message: err.message };
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(object));
            res.end();
        });
    }

    public static getBehaviour(req: Request, res: Response) {
        const name = req.params.name;
        const code = req.params.code;
        BehaviourManager.instance.getBehaviour(name, code).then((value) => {
            res.status(200);
            const object = { message: "Operation complete", data: value };
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(object));
            res.end();
        }).catch((err: Error) => {
            res.status(500);
            const object = { error: "Internal error", message: err.message };
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(object));
            res.end();
        });
    }

    public static createBehaviour(req: Request, res: Response) {
        const name = req.body.name;
        const code = req.body.code;
        BehaviourManager.instance.createBehaviour(name, code).then((value) => {
            res.status(201);
            const object = { error: "", message: "Behaviour created" };
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(object));
            res.end();
        }).catch((err: Error) => {
            res.status(500);
            const object = { error: "Internal error", message: err.message };
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(object));
            res.end();
        });
    }

    public static deleteBehaviour(req: Request, res: Response) {
        const name = req.params.name;
        const code = req.params.code;
        BehaviourManager.instance.deleteBehaviour(name, code).then((value) => {
            if (value) {
                res.status(200);
                const object = { message: "Behaviour deleted" };
                res.setHeader("Content-type", "application/json");
                res.send(JSON.stringify(object));
                res.end();
            } else {
                res.status(404);
                const object = { error: "Not found", message: "Behaviour not found" };
                res.setHeader("Content-type", "application/json");
                res.send(JSON.stringify(object));
                res.end();
            }
        }).catch((err: Error) => {
            res.status(500);
            const object = { error: "Internal error", message: err.message };
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(object));
            res.end();
        });
    }
}