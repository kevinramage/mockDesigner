import * as winston from "winston";
import * as util from "util";
import { IServiceAction } from "./serviceAction";

export class ServiceWait implements IServiceAction {

    private _time : number;

    constructor() {
        this._time = 0;
    }

    generate(tab: string): string {
        winston.debug("ServiceWait.generate");
        var code = "";

        code += tab + util.format("// Wait\n");
        code += tab + util.format("await TimeUtils.wait(%d);\n\n", this.time);

        return code;
    }

    public get time() {
        return this._time;
    }

    public set time(value) {
        this._time = value;
    }
}