import { format } from "util";

export class Check {
    private _path: string;
    private _required: boolean;
    private _enumValues: string[];

    constructor(path: string) {
        this._path = path;
        this._required = true;
        this._enumValues = [];
    }

    public addEnumValue(value: string) {
        this._enumValues.push(value);
    }

    public toString() {
        return format("required - %s\n", this.path);
    }

    public static toString(checks: Check[]) {
        /*
        const buffer = Buffer.alloc(checks.length * 100);
        checks.forEach(check => {
            buffer.write(check.toString(), "utf8");
        });
        return buffer.toString();*/
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