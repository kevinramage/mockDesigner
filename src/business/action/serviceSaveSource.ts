
export class ServiceSaveSource {
    private _type : string | undefined;
    private _fiedName : string | undefined;

    public get type() {
        return this._type;
    }
    public set type(value) {
        this._type = value;
    }
    public get fieldName() {
        return this._fiedName;
    }
    public set fieldName(value) {
        this._fiedName = value;
    }
}