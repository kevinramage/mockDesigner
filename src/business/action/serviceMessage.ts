import * as winston from "winston";
import * as util from "util";
import { IServiceAction } from "./serviceAction";
import { ServiceMessageHeader } from "./serviceMessageHeader";

export class ServiceMessage implements IServiceAction {

    private _status : number;
    private _headers : ServiceMessageHeader[];
    private _body: string | undefined;
    private _bodyFileName : string | undefined;

    constructor() {
        this._status = 200;
        this._headers = [];
    }

    public generate(tab: string) {
        winston.debug("ServiceMessage.generate");
        var code = this.generateEvaluateStatus(tab);
        code += this.generateEvaluateHeaders(tab);
        code += this.generateEvaluateBody(tab);
        return code;
    }

    private generateEvaluateStatus(tab: string) {
        winston.debug("ServiceMessage.generateEvaluateStatus");
        return tab + util.format("res.status(%s);\n", this._status);
    }

    private generateEvaluateHeaders(tab: string) {
        winston.debug("ServiceMessage.generateEvaluateHeaders");
        var code = "";
        this._headers.forEach(header => {
            code += header.generate(tab);
        });
        return code;
    }

    private generateEvaluateBody(tab: string) {
        winston.debug("ServiceMessage.generateEvaluateBody");
        var code = "";
        if ( this._bodyFileName ) {
            code += tab + util.format("var body = fs.readFileSync(\"%s\");\n", this._bodyFileName);
            code += tab + "const content = await TemplateManager.instance.evaluate(body.toString());\n"
        } else if ( this._body  ) {
            code += tab + util.format("const content = await TemplateManager.instance.evaluate(\"%s\");\n", this._body);
        }
        code += tab + "res.send(content);\n";
        code += tab + "res.end();\n";
        return code;
    }

    public addHeader(header : ServiceMessageHeader ) {
        this._headers.push(header);
    }


    public get status() {
        return this._status;
    }
    public set status(value) {
        this._status = value;
    }

    public get bodyFileName() {
        return this._bodyFileName;
    }
    public set bodyFileName(value) {
        this._bodyFileName = value;
    }
    
    public get body() {
        return this._body;
    }
    public set body(value) {
        this._body = value;
    }
}