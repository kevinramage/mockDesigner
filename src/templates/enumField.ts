export class EnumField {
    private _field : string;
    private _values : string[];

    constructor(field : string) {
        this._field = field;
        this._values = [];
    }

    public addValue(value: string) {
        this._values.push(value);
    }

    public get field() {
        return this._field;
    }
    public set field(value) {
        this._field = value;
    }

    public get values() {
        return this._values;
    }
}