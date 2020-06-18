export class Response {
    private _code: number;
    private _content : string;
    private _contentType : string;

    constructor() {
        this._contentType = "";
        this._code = 200;
        this._content = "";
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
}