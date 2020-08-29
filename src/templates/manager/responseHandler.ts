import * as fs from "fs";
import * as util from "util";
import * as winston from "winston";
import { Request, Response } from "express";
import { TemplateManager } from "./templateManager";
import { Context } from "../context";
import { RedisManager } from "./redisManager";

export class ResponseHandler {

    public static async sendContentFromFile(context: Context, res: Response, status: number, fileName: string, headers: {[key: string]: string} ) {
        winston.debug("ResponseHandler.sendContentFromFile");
        var body = "", errorMessage = "";
        const defaultResponseDirectory = "responses";
        const responseDirectory = fs.existsSync(defaultResponseDirectory) ? defaultResponseDirectory : "../" +defaultResponseDirectory;
        try {
            const buffer = fs.readFileSync(util.format("%s/%s", responseDirectory, fileName));
            body = buffer.toString();
        } catch (err) {
            errorMessage = util.format("Impossible to find the file: %s/%s", responseDirectory, fileName);
            const contentTypeKey = Object.keys(headers).find(h => { return h.toLowerCase() == "content-type"; });
            var contentType = "plain/text";
            if ( contentTypeKey ) {
                contentType = headers[contentTypeKey];
            }
            this.sendError(context, res, errorMessage, contentType);
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

        // Save request and response
        RedisManager.instance.saveRequestAndResponse(context, status, body, headers);
    }

    public static sendError(context: Context, res: Response, errorMessage: string, type: string) {
        winston.debug("ResponseHandler.sendError");
        if ( type.toLowerCase() == "application/json") {
            this.sendJSONError(context, res, errorMessage);
        } else if ( type.toLowerCase() == "application/xml" ) {
            this.sendXMLError(context, res, errorMessage);
        } else {
            this.sendTextError(context, res, errorMessage);
        }
    }

    /*
    public static sendResourceNotFound(context: Context, res: Response, errorMessage: string, type: string) {
        winston.debug("ResponseHandler.sendResourceNotFound");
        if ( type.toLowerCase() == "application/json") {
            this.sendJSONResourceNotFound(res, errorMessage);
        } else if ( type.toLowerCase() == "application/xml" ) {
            this.sendXMLResourceNotFound(res, errorMessage);
        } else {
            this.sendTextResourceNotFound(res, errorMessage);
        }
    }
    */

    private static sendJSONError(context: Context, res: Response, errorMessage: string) {
        const body = JSON.stringify({ "code": 500, "errorMessage": errorMessage});
        res.status(500);
        res.setHeader("Content-Type", "application/json");
        res.write(body);
        res.end();

        // Save request and response
        const headers :  {[key: string]: string} = {};
        headers["Content-Type"] = "application/json";
        RedisManager.instance.saveRequestAndResponse(context, 500, body, headers);
    }

    private static sendXMLError(context: Context, res: Response, errorMessage: string) {
        const body = util.format("<error><message>%s</message></error>", errorMessage)
        res.status(500);
        res.setHeader("Content-Type", "application/xml");
        res.write(body);
        res.end();

        // Save request and response
        const headers :  {[key: string]: string} = {};
        headers["Content-Type"] = "application/xml";
        RedisManager.instance.saveRequestAndResponse(context, 500, body, headers);
    }

    private static sendTextError(context: Context, res: Response, errorMessage: string) {
        res.status(500);
        res.setHeader("Content-Type", "text/plain");
        res.write(errorMessage);
        res.end();

        // Save request and response
        const headers :  {[key: string]: string} = {};
        headers["Content-Type"] = "text/plain";
        RedisManager.instance.saveRequestAndResponse(context, 500, errorMessage, headers);
    }

    private static sendJSONResourceNotFound(context: Context, res: Response, errorMessage: string) {
        const body = JSON.stringify({ code: 404, "errorMessage": errorMessage});
        res.status(404);
        res.setHeader("Content-Type", "application/json");
        res.write(body);
        res.end();

        // Save request and response
        const headers :  {[key: string]: string} = {};
        headers["Content-Type"] = "application/json";
        RedisManager.instance.saveRequestAndResponse(context, 404, body, headers);
    }

    /*
    private static sendXMLResourceNotFound(res: Response, errorMessage: string) {
        const body = util.format("<error><message>%s</message></error>", errorMessage)
        res.status(404);
        res.setHeader("Content-Type", "application/xml");
        res.write(body);
        res.end();
    }
    */

    /*
    private static sendTextResourceNotFound(res: Response, errorMessage: string) {
        res.status(404);
        res.setHeader("Content-Type", "text/plain");
        res.write(errorMessage);
        res.end();
    }
    */

    public static sendDefaultJSONInternalError(context: Context, res: Response) {
        ResponseHandler.sendJSONError(context, res, "An internal error occured");
    }

    public static sendDefaultJSONResourceNotFound(context: Context, res: Response) {
        ResponseHandler.sendJSONResourceNotFound(context, res, "Resource not found");
    }

    public static sendMethodNotAllow(context: Context, res: Response) {
        res.status(405);
        res.setHeader("Content-Type", "application/json");
        const body = { code: "405", message: "Method not allow" }
        res.write(JSON.stringify(body));
        res.end();

        // Save request and response
        const headers :  {[key: string]: string} = {};
        headers["Content-Type"] = "application/json";
        RedisManager.instance.saveRequestAndResponse(context, 405, JSON.stringify(body), headers);
    }

    public static sendInternalError(context: Context, res: Response) {
        res.status(500);
        res.setHeader("Content-Type", "application/json");
        const body = { code: "500", message: "An internal error occured" }
        res.write(JSON.stringify(body));
        res.end();

        // Save request and response
        const headers :  {[key: string]: string} = {};
        headers["Content-Type"] = "application/json";
        RedisManager.instance.saveRequestAndResponse(context, 500, JSON.stringify(body), headers);
    }

    public static sendYAMLContent(body: string, res: Response) {
        res.status(200);
        res.setHeader("Content-Type", "text/vnd.yaml");
        res.write(body);
        res.end();
    }

    public static getRequest(request: Request, response: Response) {
        winston.debug("ResponseHandler.getRequest");
        const serviceName = request.query.serviceName as string;
        const keys = ResponseHandler.getRequestCollectKeys(request);
        response.setHeader("Content-Type", "application/json");
        if ( serviceName ) {
            RedisManager.instance.getRequest(serviceName, keys).then((content) => {
                if ( content != null ) {
                    response.status(200);
                    response.write(JSON.stringify(content));
                } else {
                    const message = util.format("No request found for the service '%s' and keys '%s'", serviceName, keys.join(", "));
                    const body = { code: 404, message: message };
                    response.status(404);
                    response.write(JSON.stringify(body));
                }
                response.end();
            }).catch((err) => {
                const body = { code: 500, message: "Internal error during get request" };
                winston.error("ResponseHandler.getRequest - Internal error during get request: ", err);
                response.status(500);
                response.write(JSON.stringify(body));
                response.end();
            });
        } else {
            const body = { code: 400, message: "Missing serviceName request query" };
            response.status(400);
            response.write(JSON.stringify(body));
            response.end();
        }
    }

    private static getRequestCollectKeys(request: Request) {
        const keys : string[] = [];
        var increment = 1;
        while ( request.query["key" + increment]) {
            keys.push(request.query["key" + increment] as string);
            increment++;
        }
        return keys;
    }
}