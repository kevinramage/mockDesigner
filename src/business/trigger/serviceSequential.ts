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
        winston.debug("ServiceSequential.addMessage");
        this._messages.push(message);
    }

    public generate(mockName: string, serviceName: string, tab: string) {
        winston.debug("ServiceSequential.generate");
        var code = "";

        // Generate threshold
        this.generateThreshold();

        // Display counter
        code += tab + util.format("winston.debug(\"Counter: \" + %s.%s_counter);\n", mockName, serviceName);

        // Generate messages
        this._messages.forEach(msg => {
            code += msg.generate(mockName, serviceName, tab);
        });

        // Increment counter
        code += tab + util.format("%s.%s_counter = (%s.%s_counter + 1) % %d;\n", mockName, serviceName, mockName, serviceName, this._max);
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