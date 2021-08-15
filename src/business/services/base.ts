import { OptionsManager } from "../core/optionsManager";
import { Request, Response } from "express";
import { format } from "util";

export class ServiceBase {

    public static sendData(res: Response, data: object | string) {
        const content = { code: 200, message: "Operation completed", data: data}
        res.status(200);
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(content));
        res.end();
    }

    public static sendDataCreated(res: Response, data: object) {
        const content = { code: 201, message: "Operation completed", data: data}
        res.status(201);
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(content));
        res.end();
    }

    public static sendOperationComplete(res: Response) {
        res.status(200);
        const object = { code: 200, message: "Operation completed"};
        res.setHeader("Content-type", "application/json");
        res.send(JSON.stringify(object));
        res.end();
    }

    public static sendInvalidRequest(res: Response, message: string) {
        res.status(400);
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify({ code: 400, message: format("Invalid request: %s", message) }));
        res.end();
    }

    public static sendResourceNotFound(res: Response, objectName: string) {
        const data = { code: "404", message: format("%s not found", objectName) };
        res.status(404);
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(data));
        res.end();
    }

    public static sendInternalError(res: Response, err?: Error) {
        const data : any = { code: "500", message: "Internal error" };
        if (err && OptionsManager.instance.debug) {
            data.error = err.message;
            data.stack = err.stack;
        }
        res.status(500);
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(data));
        res.end();
    }
}