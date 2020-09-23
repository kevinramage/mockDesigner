import { format } from "util";

export class Check {
    private _path: string;
    private _required: boolean;
    private _enumValues: string[];

    constructor(path: string, enumValues?: string[]) {
        this._path = path;
        if ( enumValues ) {
            this._required = false;
            this._enumValues = enumValues;
        } else {
            this._required = true;
            this._enumValues = [];
        }
    }

    public addEnumValue(value: string) {
        this._enumValues.push(value);
    }

    public toString() {
        if ( this.isRequired ) {
            return format("required - %s\n", this.path);
        } else {
            return format("enum - %s (%s)\n", this.path, this.enumValues.join(", "));
        }
    }

    public static toString(checks: Check[]) {
        var result = "";
        checks.forEach(check => { result += check.toString(); })
        return result;
    }

    public get path() {
        return this._path;
    }

    public set path(value) {
        this._path = value;
    }

    public get isRequired() {
        return this._required;
    }

    public set isRequired(value) {
        this._required = value;
    }

    public get enumValues() {
        return this._enumValues;
    }
}