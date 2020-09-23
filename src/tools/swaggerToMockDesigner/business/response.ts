
import { format } from "util";
import { v4 } from "uuid";

export class Response {
    private _uuid: string;
    private _code: number;
    private _content : any;
    private _contentType : string;
    private _description: string;

    constructor() {
        this._uuid = v4();
        this._contentType = "";
        this._code = 200;
        this._content = null;
        this._description = "";
    }

    public get uuid() {
        return this._uuid;
    }

    public get code() {
        return this._code;
    }
    public set code(value) {
        this._code = value;
    }

    public get contentType() {
        return this._contentType;
    }
    public set contentType(value) {
        this._contentType = value;
    }

    public get content() {
        if ( this._content != null ) {
            return this._content;
        } else {
            return this.generateDefaultMessage;
        }
    }
    public set content(value) {
        this._content = value;
    }

    public get isIncludedInExternalFile() {
        return this._content && JSON.stringify(this._content).length > 10;
    }

    public getExternalFileName(name: string) {
        var extention = "txt";
        if ( this.contentType == "application/json") {
            extention = "json";
        } else if ( this.contentType == "application/xml") {
            extention = "xml"
        }
        return format("%s_%d_response.%s", name, this.code, extention);
    }

    public get description() {
        return this._description;
    }

    public set description(value) {
        this._description = value;
    }

    public get generateDefaultMessage() {
        return {
            code: this.code,
            messsage: this.description
        }
    }
}