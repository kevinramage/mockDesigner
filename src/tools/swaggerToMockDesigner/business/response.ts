import { format } from "util";

export class Response {
    private _code: number;
    private _content : any;
    private _contentType : string;

    constructor() {
        this._contentType = "";
        this._code = 200;
        this._content = null;
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
        return this._content;
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
}