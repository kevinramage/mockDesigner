import * as winston from "winston";
import * as util from "util";
import { IServiceTrigger } from "./serviceTrigger";
import { ServiceSequentialMessage } from "./serviceSequentialTriggerMessage";

export class ServiceSequential implements IServiceTrigger {

    private _messages : ServiceSequentialMessage[];
    private _max : number | undefined;
    
    constructor() {
        this._messages = [];
    }

    public addMessage(message: ServiceSequentialMessage) {
        this._messages.push(message);
    }

    public generate(mockName: string, tab: string) {
        var code = "";

        // Generate threshold
        this.generateThreshold();

        // Display counter
        code += tab + util.format("winston.info(\"Counter: \" + %s._counter);\n", mockName);

        // Generate messages
        this._messages.forEach(msg => {
            code += msg.generate(mockName, tab);
        });

        // Increment counter
        code += tab + util.format("%s._counter = (%s._counter + 1) % %d;\n", mockName, mockName, this._max);
        code += "\n";

        return code;
    }

    private generateThreshold() {
        var threshold = 0;
        this._messages.forEach(msg => {
            msg.minThreshold = threshold;
            threshold += msg.repeat;
            msg.maxThreshold = threshold;
        });
        this._max = threshold;
        return threshold;
    }

    public get messages() {
        return this._messages;
    }

    public get max() {
        return this._max;
    }
}