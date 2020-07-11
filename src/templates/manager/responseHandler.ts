import * as fs from "fs";
import * as util from "util";
import * as winston from "winston";
import { Response } from "express";
import { TemplateManager } from "./templateManager";
import { Context } from "../context";

export class ResponseHandler {

    public static async sendContentFromFile(context: Context, res: Response, status: number, fileName: string, headers: {[key: string]: string} ) {
        winston.debug("ResponseHandler.sendContentFromFile");
        var body = "", errorMessage = "";
        const defaultResponseDirectory = "responses";
        try {
            const responseDirectory = fs.existsSync(defaultResponseDirectory) ? defaultResponseDirectory : "../" +defaultResponseDirectory;
            const buffer = fs.readFileSync(util.format("%s/%s", responseDirectory, fileName));
            body = buffer.toString();
        } catch (err) {
            errorMessage = util.format("Impossible to find the file: %s/%s", defaultResponseDirectory, fileName);
            const contentTypeKey = Object.keys(headers).find(h => { return h.toLowerCase() == "content-type"; });
            var contentType = "plain/text";
            if ( contentTypeKey ) {
                contentType = headers[contentTypeKey];
            }
            this.sendError(res, errorMessage, contentType);
        }
        if ( errorMessage == "") {
            await this.sendContent(context, res, status, body, headers);
        }
    }

    public static async sendContent(context: Context, res: Response, status: number, body: string, headers: {[key: string]: string}) {
        winston.debug("ResponseHandler.sendContent");
        res.status(status);

        // Headers
        Object.keys(headers).forEach(async key => {
            const headerValue = await TemplateManager.instance.evaluate(headers[key], context);
            res.setHeader(key, headerValue);
        });

        // Body
        if ( body ) {
            var bodyEvaluated = body;
            if ( bodyEvaluated.includes("%s") && context.messages.length > 0 ) {
                bodyEvaluated = bodyEvaluated.replace("%s", context.messages[0]);
            }
            bodyEvaluated = await TemplateManager.instance.evaluate(bodyEvaluated, context);
            res.write(bodyEvaluated); 
        }
        res.end();
    }

    public static sendError(res: Response, errorMessage: string, type: string) {
        winston.debug("ResponseHandler.sendError");
        if ( type.toLowerCase() == "application/json") {
            this.sendJSONError(res, errorMessage);
        } else if ( type.toLowerCase() == "application/xml" ) {
            this.sendXMLError(res, errorMessage);
        } else {
            this.sendTextError(res, errorMessage);
        }
    }

    public static sendResourceNotFound(res: Response, errorMessage: string, type: string) {
        winston.debug("ResponseHandler.sendError");
        if ( type.toLowerCase() == "application/json") {
            this.sendJSONResourceNotFound(res, errorMessage);
        } else if ( type.toLowerCase() == "application/xml" ) {
            this.sendXMLResourceNotFound(res, errorMessage);
        } else {
            this.sendTextResourceNotFound(res, errorMessage);
        }
    }

    private static sendJSONError(res: Response, errorMessage: string) {
        const body = JSON.stringify({ "code": 500, "errorMessage": errorMessage});
        res.status(500);
        res.setHeader("Content-Type", "application/json");
        res.write(body);
        res.end();
    }

    private static sendXMLError(res: Response, errorMessage: string) {
        const body = util.format("<error><message>%s</message></error>", errorMessage)
        res.status(500);
        res.setHeader("Content-Type", "application/xml");
        res.write(body);
        res.end();
    }

    private static sendTextError(res: Response, errorMessage: string) {
        res.status(500);
        res.setHeader("Content-Type", "text/plain");
        res.write(errorMessage);
        res.end();
    }

    private static sendJSONResourceNotFound(res: Response, errorMessage: string) {
        const body = JSON.stringify({ code: 404, "errorMessage": errorMessage});
        res.status(404);
        res.setHeader("Content-Type", "application/json");
        res.write(body);
        res.end();
    }

    private static sendXMLResourceNotFound(res: Response, errorMessage: string) {
        const body = util.format("<error><message>%s</message></error>", errorMessage)
        res.status(404);
        res.setHeader("Content-Type", "application/xml");
        res.write(body);
        res.end();
    }

    private static sendTextResourceNotFound(res: Response, errorMessage: string) {
        res.status(404);
        res.setHeader("Content-Type", "text/plain");
        res.write(errorMessage);
        res.end();
    }

    public static sendDefaultJSONInternalError(res: Response) {
        ResponseHandler.sendJSONError(res, "An internal error occured");
    }

    public static sendDefaultJSONResourceNotFound(res: Response) {
        ResponseHandler.sendJSONResourceNotFound(res, "Resource not found");
    }

    public static sendMethodNotAllow(res: Response) {
        res.status(405);
        res.setHeader("Content-Type", "application/json");
        const body = { code: "405", message: "Method not allow" }
        res.write(JSON.stringify(body));
        res.end();
    }

    public static sendInternalError(res: Response) {
        res.status(500);
        res.setHeader("Content-Type", "application/json");
        const body = { code: "500", message: "An internal error occured" }
        res.write(JSON.stringify(body));
        res.end();
    }
}