import * as winston from "winston";
import * as util from "util";
import { IServiceAction } from "../action/serviceAction";

export class ServiceSequentialMessage {

    private _minThreshold : number | undefined;
    private _maxThreshold : number | undefined;
    private _repeat : number;
    private _actions : IServiceAction[];

    constructor() {
        this._repeat = 1;
        this._actions = [];
    }

    public generate(mockName: string, serviceName: string, tab: string) {
        var code = "";

        code += tab + util.format("if ( !triggerApplied && %s.%s_counter >= %d && %s.%s_counter < %d ) {\n", mockName, serviceName, this._minThreshold, mockName, serviceName, this._maxThreshold);
        code += tab + "\ttriggerApplied = true;\n\n";
        this._actions.forEach(action => {
            code += action.generate(tab + "\t");
        });
        code += tab + "}\n\n";

        return code;
    }

    public addAction(action: IServiceAction) {
        this._actions.push(action);
    }

    public get repeat(){
        return this._repeat;
    }
    public set repeat(value) {
        this._repeat = value;
    }

    public get actions() {
        return this._actions;
    }
    public set actions(value) {
        this._actions = value;
    }

    public get minThreshold() {
        return this._minThreshold;
    }
    public set minThreshold(value) {
        this._minThreshold = value;
    }

    public get maxThreshold() {
        return this._maxThreshold;
    }
    public set maxThreshold(value) {
        this._maxThreshold = value;
    }
}