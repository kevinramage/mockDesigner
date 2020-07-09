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
        var code = "";

        // Generate headers
        code += tab + "// Write the response\n";
        code += tab + "const headers : {[key: string]: string} = {};\n";
        this._headers.forEach(h => {
            code += tab + util.format("headers[\"%s\"] = \"%s\";\n", h.key, h.value);
        });

        // Send a body file
        if ( this._bodyFileName ) {
            code += tab + util.format("await ResponseHandler.sendContentFromFile(context, res, %s, \"%s\", headers);\n", this.status, this.bodyFileName);
        }

        // Send a body
        else {
            var body = this.body || "";
            body = body.replace(/\"/g, "\\\"");
            code += tab + util.format("await ResponseHandler.sendContent(context, res, %s, \"%s\", headers);\n", this.status, body);
        }

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