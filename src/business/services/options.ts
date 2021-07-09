import { OptionsManager } from "../core/optionsManager";
import { Request, Response } from "express";

export class OptionService {

    public static getAllOptions(req: Request, res: Response) {
        res.status(200);
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(OptionsManager.instance.options));
        res.end();
    }

    public static getOption(req: Request, res: Response) {
        const key = req.query.key as string | undefined;
        if (key) {
            const option = OptionsManager.instance.options[key];
            if (option) {
                res.status(200);
                res.setHeader("content-type", "application/json");
                res.send(JSON.stringify(option));
                res.end();
            } else {
                res.status(404);
                res.setHeader("content-type", "application/json");
                res.send(JSON.stringify({ code: 404, message: "Resource not found", error: "Option not found" }));
                res.end();
            }
        } else {
            res.status(400);
            res.setHeader("content-type", "application/json");
            res.send(JSON.stringify({ code: 400, message: "Invalid request", error: "Query key must be defined" }));
            res.end();
        }
    }

    public static updateOption(req: Request, res: Response) {
        const key = req.body.key as string | undefined;
        const value = req.body.value as string | undefined;
        if (key && value) {
            if (OptionsManager.instance.options[key]) {
                OptionsManager.instance.options[key] = value;
                const isSaved = OptionsManager.instance.saveOptions();
                if (isSaved) {
                    res.status(200);
                    res.setHeader("content-type", "application/json");
                    res.send(JSON.stringify(value));
                    res.end();
                } else {
                    res.status(500);
                    res.setHeader("content-type", "application/json");
                    res.send(JSON.stringify({ code: 500, message: "Internal error", error: "Impossible to save options"}));
                    res.end();
                }
            } else {
                res.status(404);
                res.setHeader("content-type", "application/json");
                res.send(JSON.stringify({ code: 404, message: "Resource not found", error: "Option not found" }));
                res.end();
            }
        } else if (!key) {
            res.status(400);
            res.setHeader("content-type", "application/json");
            res.send(JSON.stringify({ code: 400, message: "Invalid request", error: "Option key must be defined" }));
            res.end();
        } else {
            res.status(400);
            res.setHeader("content-type", "application/json");
            res.send(JSON.stringify({ code: 400, message: "Invalid request", error: "Option value must be defined" }));
            res.end();
        }
    }

    public static resetOption(req: Request, res: Response) {
        OptionsManager.instance.reset();
        const isSaved = OptionsManager.instance.saveOptions();
        if (isSaved) {
            res.status(200);
            res.setHeader("content-type", "application/json");
            res.send(JSON.stringify(OptionsManager.instance.options));
            res.end();
        } else {
            res.status(500);
            res.setHeader("content-type", "application/json");
            res.send(JSON.stringify({ code: 500, message: "Internal error", error: "Impossible to save options"}));
            res.end();
        }
    }
}