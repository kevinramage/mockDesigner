import { JSONTemplateRender } from "../../core/JSONTemplateRender";
import { readFileSync } from "fs";
import { join } from "path";
import { Context } from "../../core/context";
import { Action } from "../action";

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
        return new Promise<void>(async resolve => {
            context.response.status(this.status);
            Object.entries(this.headers).forEach((values) => {
                context.response.setHeader(values[0], values[1]);
            });
            if (this.bodyFile) {
                const path = join(this._workspace, "responses", this.bodyFile);
                const content = readFileSync(path);
                await this.sendText(content.toString(), context);
                resolve();
            } else {
                await this.sendText(this.bodyText, context);
                resolve();
            }
        });

    }

    private sendText(input: string, context: Context) {
        return new Promise<void>(resolve => {
            if (this.template) {
                new JSONTemplateRender(context).render(input).then((value) => {
                    context.response.send(value);
                    context.response.end();
                    resolve();

                }).catch((err) => {
                    context.response.send("Internal error: " + err);
                    context.response.end();
                    resolve();
                });
            } else {
                context.response.send(input);
                context.response.end();
                resolve();
            }
        });
    }

    public addHeader(name: string, value: string) {
        this._headers[name] = value;
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