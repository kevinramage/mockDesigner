import * as winston from "winston";
import * as util from "util";
import { IServiceAction } from "../action/serviceAction";

export class ServiceRandomMessage {
    private _minThreshold : number | undefined;
    private _maxThreshold : number | undefined;
    private _probability : number;
    private _actions : IServiceAction[];

    constructor() {
        this._probability = 1;
        this._actions = [];
    }

    public generate(tab: string) {
        var code = "";

        code += tab + util.format("if ( !triggerApplied && randomValue >= %d && randomValue < %d ) {\n", this._minThreshold, this._maxThreshold);
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

    
    public get probability() {
        return this._probability;
    }
    public set probability(value) {
        this._probability = value;
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