import * as winston from "winston";
import * as util from "util";
import { IServiceAction } from "./serviceAction";
import { ServiceMessageHeader } from "./serviceMessageHeader";

export class ServiceMessage implements IServiceAction {

    private _status : number;
    private _headers : ServiceMessageHeader[];
    private _bodyFileName : string;

    constructor() {
        this._status = 200;
        this._headers = [];
        this._bodyFileName = "";
    }

    public generate() {
        winston.debug("ServiceMessage.generate");
        var code = this.generateEvaluateStatus();
        code += this.generateEvaluateHeaders();
        code += this.generateEvaluateBody();
        return code;
    }

    private generateEvaluateStatus() {
        winston.debug("ServiceMessage.generateEvaluateStatus");
        return util.format("\t\tres.status(%s);\n", this._status);
    }

    private generateEvaluateHeaders() {
        winston.debug("ServiceMessage.generateEvaluateHeaders");
        var code = "";
        this._headers.forEach(header => {
            code += header.generate();
        });
        return code;
    }

    private generateEvaluateBody() {
        winston.debug("ServiceMessage.generateEvaluateBody");
        var code = util.format("\t\tvar body = fs.readFileSync(\"%s\");\n", this._bodyFileName);
        code += "\t\tconst content = await TemplateManager.instance.evaluate(body.toString());"
        code += "\t\tres.send(content);\n";
        code += "\t\tres.end();\n";
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
}