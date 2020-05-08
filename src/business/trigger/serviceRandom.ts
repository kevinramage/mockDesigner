import * as winston from "winston";
import * as util from "util";
import { IServiceTrigger } from "./serviceTrigger";
import { ServiceRandomMessage } from "./serviceRandomMessage";

export class ServiceRandom implements IServiceTrigger {

    private _messages : ServiceRandomMessage[];
    private _max : number | undefined;

    constructor() {
        this._messages = [];
    }
    
    public generate(mockName: string, tab: string) {
        winston.debug("ServiceRandom.generate");
        var code = "";
        
        // Generate threshold
        this.generateThreshold();

        // generate code
        code += tab + util.format("const randomValue = Math.round(Math.random() * %d);\n", this.max);
        code += tab + "winston.info(\"Random value: \" + randomValue);\n";
        this._messages.forEach(msg => {
            code += msg.generate(tab);
        });

        return code;
    }

    private generateThreshold() {
        var threshold = 0;
        this._messages.forEach(msg => {
            msg.minThreshold = threshold;
            threshold += msg.probability;
            msg.maxThreshold = threshold;
        });
        this._max = threshold - 1;
        return threshold;
    }

    public addMessage(message: ServiceRandomMessage) {
        this._messages.push(message);
    }

    public get max() {
        return this._max;
    }
}