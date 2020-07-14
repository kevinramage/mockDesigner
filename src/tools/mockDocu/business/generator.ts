import * as fs from "fs";
import * as yaml from "yaml";
import * as winston from "winston";
import * as util from "util";
import { IMock } from "../interface/mock";
import { IService } from "interface/service";
import { ITrigger, IDataTrigger, INoTrigger, IValidateTrigger, IRandomTrigger, ISequentialMessage, ISequentialTrigger } from "interface/trigger";
import { IAction, IMessageAction, ISaveAction, IWaitAction, IMicroServiceAction } from "interface/action";

export class Generator {

    private _input : string;
    private _ouput : string;

    constructor() {
        this._input = "";
        this._ouput = "";
    }

    public run() {
        const mock = this.readMock();
        if ( mock ) {
            const code = this.buildMock(mock);
            const result = this.writeMock(code);
            if ( result ) {
                winston.info("MockDocu - Complete");
            }
        }
    }

    private readMock() {
        winston.info("MockDocu - ReadMock");
        try {
            const buffer = fs.readFileSync(this.input);
            const body = buffer.toString();
            const yamlFile = yaml.parse(body);
            return yamlFile as IMock;
        } catch (ex) {
            winston.error("MockDocu - ReadMock - Internal error: ", ex);
            return null;
        }
    }

    private buildMock(mock: IMock) {
        winston.info("MockDocu - BuildDocumentation");
        var code = "";
        code += util.format("# Mock %s\n\n", mock.name);
        mock.services.forEach(service => {
            code += this.buildService(service);
        });
        return code;
    }

    private buildService(service: IService) {
        const instance = this;
        var code = "";
        code += util.format("## Service %s\n\n", service.name);
        code += "\n### Access\n\n";
        code += util.format("%s %s HTTP\n", service.method, service.path);
        service.response.triggers.forEach(trigger => {
            code += instance.buildTrigger(trigger);
        });
        return code;
    }

    private buildTrigger(trigger: ITrigger) {
        var code = "";
        switch ( trigger.type ) {
            case "none":
                code += this.buildNoTrigger(trigger as INoTrigger);
            break;

            case "data": 
                code += this.buildDataTrigger(trigger as IDataTrigger); 
            break;

            case "validate":
                code += this.buildValidateTrigger(trigger as IValidateTrigger);
            break;

            case "random":
                code += this.buildRandomTrigger(trigger as IRandomTrigger);
            break;

            case "sequential":
                code += this.buildSequentialTrigger(trigger as ISequentialTrigger);
            break;

            default:
                winston.warn("MockDocu - Build Trigger - No trigger defined for " + trigger.type);
        }
        return code;
    }

    private buildNoTrigger(trigger: INoTrigger) {
        const instance = this;
        var code = "";
        code += "------\n";
        code += "**Actions**: \n";
        trigger.actions.forEach(action => {
            code += instance.buildAction(action);
        });
        code += "\n";
        return code;
    }

    private buildDataTrigger(trigger: IDataTrigger) {
        const instance = this;
        var code = "";
        code += "------\n";
        code += "**Conditions**: \n";
        trigger.conditions.forEach(condition => {
            code += util.format("* %s  %s  %s\n", condition.leftOperand, condition.operation, condition.rightOperand);
        });
        code += "\n**Actions**: \n";
        trigger.actions.forEach(action => {
            code += instance.buildAction(action);
        });
        code += "\n";
        return code;
    }

    private buildValidateTrigger(trigger: IValidateTrigger) {
        const instance = this;
        var code = "";
        code += "------\n";
        code += "**Validations**: \n";
        trigger.mandatoriesFields.forEach(mandatoryField => {
            code += util.format("* %s\n", mandatoryField);
        });
        code += "\n**Actions**: \n";
        trigger.actions.forEach(action => {
            code += instance.buildAction(action);
        });
        code += "\n";
        return code;
    }

    private buildRandomTrigger(trigger: IRandomTrigger) {
        const instance = this;
        var code = "";
        var max = trigger.messages.map((msg) => { return msg.probability}).reduce((acc, current) => {
            return acc + current; 
        });
        code += "------\n";
        trigger.messages.forEach(msg => {
            code += "**Message**\n";
            code += util.format("Probability %d %\n", msg.probability * 100 / max);
            code += "\n**Actions**: \n";
            msg.actions.forEach(action => {
                code += instance.buildAction(action);
            });
            code += "\n";
        });
        return code;
    }

    private buildSequentialTrigger(trigger: ISequentialTrigger) {
        const instance = this;
        var code = "";
        var max = trigger.messages.map((msg) => { return msg.repeat}).reduce((acc, current) => {
            return acc + current; 
        });
        code += "------\n";
        trigger.messages.forEach(msg => {
            code += "**Message**\n";
            code += util.format("Repeat %d/%d %\n", msg.repeat, max);
            code += "\n**Actions**: \n";
            msg.actions.forEach(action => {
                code += instance.buildAction(action);
            });
            code += "\n";
        });
        return code;
    }

    private buildAction(action: IAction) {
        var code = "";
        switch ( action.type ) {

            case "message":
                code += this.buildMessageAction(action as IMessageAction);
            break;

            case "save":
                code += this.buildSaveAction(action as ISaveAction);
            break;

            case "wait":
                code += this.buildWaitAction(action as IWaitAction);
            break;

            case "microservice":
                code += this.buildMicroServiceAction(action as IMicroServiceAction);
            break;

            default:
                winston.warn("MockDocu - Build Trigger - No action defined for " + action.type);
        }
        return code;
    }

    private buildMessageAction(action: IMessageAction) {
        var code = "";
        var contentType = "";
        if ( action.headers && action.headers && action.headers["content-type"] && action.headers["content-type"] ) {
            contentType = action.headers["content-type"];
        }
        if ( contentType == "application/json" ) {
            code += util.format("* Send JSON response (%d)\n\n", action.status);
            if ( action.bodyFile ) {
                code += util.format("> file: %s", action.bodyFile);
            }
        } else {
            code += util.format("* Send response (%d)\n\n", action.status);
            if ( action.bodyFile ) {
                code += util.format("> file: %s", action.bodyFile);
            }
        }
        return code;
    }

    private buildSaveAction(action: ISaveAction) {
        var code = "";
        code += util.format("* Save %s\n", action.storage);
        return code;
    }

    private buildWaitAction(action: IWaitAction) {
        var code = "";
        code += util.format("* Wait %d\n", action.time);
        return code;
    }

    private buildMicroServiceAction(action: IMicroServiceAction) {
        var code = "";
        code += util.format("* MicroService - %s\n", action.action);
        return code;
    }

    private writeMock(code: string) {
        winston.info("MockDocu - WriteDocumentation");
        try {
            fs.writeFileSync(this.output, code);
            return true;
        } catch (ex) {
            winston.error("MockDocu - WriteDocumentation - Internal error: ", ex);
            return false;
        }
    }

    public get input() {
        return this._input;
    }

    public set input(value) {
        this._input = value;
    }

    public get output() {
        return this._ouput;
    }

    public set output(value) {
        this._ouput = value;
    }
}