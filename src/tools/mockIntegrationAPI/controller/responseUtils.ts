import { Response } from "express";

export class ResponseUtils {

    public static sendSucceedResponse(res: Response, data?: any) {
        const content = data || {};
        const body = { code: 200, message: "Operation completed", data: content};
        res.status(200);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(body));
    }

    public static sendCreatedResponse(res: Response, data?: any) {
        const content = data || {};
        const body = { code: 201, message: "Created successfully", data: content};
        res.status(201);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(body));
    }

    public static sendDeletedResponse(res: Response) {
        res.status(204);
        res.send();
    }

    public static sendValidationError(res: Response, message: string) {
        const body = { code: 400, message: "Validation error: " + message};
        res.status(400);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(body));
    }

    public static sendInternalError(res: Response) {
        const body = { code: 500, message: "An internal error occured"};
        res.status(500);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(body));
    }
}