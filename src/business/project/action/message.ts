import { JSONTemplateRender } from "../../core/JSONTemplateRender";
import { readFileSync } from "fs";
import { join } from "path";
import { Context } from "../../core/context";
import { Action } from "../action";
import { MonitoringManager } from "../../core/monitoringManager";
import { ACTIONS } from "../../utils/enum";
import { ContentTypeDetection } from "../../utils/contentTypeDetection";
import { OptionsManager } from "../../core/optionsManager";

import * as winston from "winston";

export class ActionMessage extends Action {

    private _workspace : string;
    private _status : number;
    private _headers : { [key: string]: string};
    private _bodyText : string;
    private _bodyFile : string;
    private _template : boolean;

    constructor(workspace: string) {
        super();
        this._status = 200;
        this._headers = {};
        this._bodyText = "";
        this._bodyFile = "";
        this._workspace = workspace;
        this._template = false;
    }

    public execute(context: Context) {
        winston.debug("MessageAction.execute - Execute action: " + this.type);
        return new Promise<void>(async (resolve, reject) => {
            try {
                if (!context.response.writableEnded) {
                    await this.sendResponse(context);
                } else {
                    winston.warn("ActionMessage.execute - A response already sent, the current action message is ignored");
                    resolve();
                }

            } catch (err) {
                reject(err);
            }
        });

    }

    private sendResponse(context: Context) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                // Get content
                const content = await this.getContent(context);
                this.detectContentType(context, content);

                // Send response
                context.response.status(this.status);
                Object.entries(this.headers).forEach((values) => {
                    context.response.setHeader(values[0], values[1]);
                });
                context.response.send(content);
                context.response.end();

                // Save response
                MonitoringManager.instance.saveResponse(this.status, this.headers, content, context.response);

            } catch (err)  {
                reject(err);
            }
        });
    }

    private detectContentType(context: Context, content: string) {
        if (!this.headers["content-type"] && OptionsManager.instance.isContentTypeDetectionEnabled) {
            this.headers["content-type"] = ContentTypeDetection.detect(content);
        }
    }

    private getContent(context: Context) {
        return new Promise<string>(async (resolve, reject) => {
            try {
                if (this.bodyFile) {
                    const path = join(this._workspace, "responses", this.bodyFile);
                    const content = readFileSync(path);
                    const text = await this.getText(content.toString(), context);
                    resolve(text);
                } else {
                    resolve(this.bodyText);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    private getText(input: string, context: Context) {
        return new Promise<string>(async (resolve, reject) => {
            try {
                let value = input;
                if (this.template) {
                    value = await new JSONTemplateRender(context).render(input);
                }
                resolve(value);
            } catch (err) {
                reject(err);
            }
        });
    }

    public addHeader(name: string, value: string) {
        this._headers[name] = value;
    }

    public toObject() {
        return {
            type: ACTIONS.MESSAGE,
            status: this.status,
            body: this.bodyFile != "" ? "File: " + this.bodyFile : this.bodyText
        }
    }

    public get status() {
        return this._status;
    }

    public set status(value) {
        this._status = value;
    }

    public get headers() {
        return this._headers;
    }

    public get bodyText() {
        return this._bodyText;
    }

    public set bodyText(value) {
        this._bodyText = value;
    }

    public get bodyFile() {
        return this._bodyFile;
    }

    public set bodyFile(value) {
        this._bodyFile = value;
    }

    public get template() {
        return this._template;
    }

    public set template(value) {
        this._template = value;
    }
}