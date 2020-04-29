import * as fs from "fs";
import * as util from "util";
import * as path from "path";
import { Request, Response } from "express";
import { TemplateManager } from "./templateManager";

export class ResponseHandler {

    public static sendContentFromFile(req: Request, res: Response, status: number, fileName: string, headers: {[key: string]: string} ) {
        var body = "", errorMessage = "";
        try {
            const JSONDirectory = fs.existsSync("JSON") ? "JSON" : "../JSON";
            const buffer = fs.readFileSync(util.format("%s/%s", JSONDirectory, fileName));
            body = buffer.toString();
        } catch (err) {
            errorMessage = util.format("Impossible to find the file: JSON/%s", fileName);
            const contentTypeKey = Object.keys(headers).find(h => { return h.toLowerCase() == "content-type"; });
            var contentType = "plain/text";
            if ( contentTypeKey ) {
                contentType = headers[contentTypeKey];
            }
            this.sendError(res, errorMessage, contentType);
        }
        if ( errorMessage == "") {
            this.sendContent(req, res, status, body, headers);
        }
    }

    public static async sendContent(req: Request, res: Response, status: number, body: string, headers: {[key: string]: string}) {
        res.status(status);

        // Headers
        Object.keys(headers).forEach(async key => {
            const headerValue = await TemplateManager.instance.evaluate(headers[key]);
            res.setHeader(key, headerValue);
        });

        // Body
        if ( body ) {
            const bodyEvaluated = await TemplateManager.instance.evaluate(body, req);
            res.write(bodyEvaluated); 
        }
        res.end();
    }

    public static sendError(res: Response, errorMessage: string, type: string) {
        if ( type.toLowerCase() == "application/json") {
            this.sendJSONError(res, errorMessage);
        } else if ( type.toLowerCase() == "application/xml" ) {
            this.sendXMLError(res, errorMessage);
        } else {
            this.sendTextError(res, errorMessage);
        }
    }

    private static sendJSONError(res: Response, errorMessage: string) {
        const body = JSON.stringify({ "errorMessage": errorMessage});
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
}