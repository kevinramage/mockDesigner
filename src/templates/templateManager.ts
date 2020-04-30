import * as util from "util";
import * as winston from "winston";
import { v4 } from "uuid";
import { RedisManager } from "./redisManager";
import { Context } from "./context";

const regexFunction = /{{([a-zA-Z0-9|_]+)\s*(\(\s*([a-zA-Z0-9|_]+(\s*,\s*[a-zA-Z0-9|_]+)*)?\s*\)\s*)}}/g;
const regexFunctionArg = /([a-zA-Z0-9|_]+)/g;
const regexRequestData = /{{\.([a-z|A-Z|0-9|_]+)\.([a-z|A-Z|0-9|_]+)}}/g;

export class TemplateManager {
    private static _instance : TemplateManager;
    private _functions : {[functionName: string]: Function};

    private constructor() {
        this._functions = {};
        this.registerFunction();
    }

    private registerFunction() {
        winston.debug("TemplateManager.registerFunction");
        this._functions["UUID"] = TemplateManager.uuid;
        this._functions["UniqueID"] = TemplateManager.uniqueId;
        this._functions["Increment"] = TemplateManager.increment;
        this._functions["NewIntegerId"] = TemplateManager.newIntegerId;
        this._functions["NewUUID"] = TemplateManager.newUUID;
    }

    public async evaluate(content: string, context: Context) {
        winston.debug("TemplateManager.evaluate");
        var bodyResult = content;

        // Apply functions
        bodyResult = await this.evaluateFunctions(content, context);

        // Evaluate requests
        if ( context ) {
            bodyResult = this.evaluateRequests(bodyResult, context);
        }

        // Apply properties

        // Apply data

        return bodyResult;
    }

    private async evaluateFunctions(content: string, context: Context) {
        winston.debug("TemplateManager.evaluateFunctions");
        var bodyResult = content;
        var match = regexFunction.exec(content);
        while ( match != null && match.length > 2) {
            const content = match[0];
            const functionName = match[1];
            const argumentsText = match[2];
            const args = this.evaluateFunctionArguments(argumentsText);
            args.unshift(context);
            const result = await this.evaluateFunction(functionName, args);
            bodyResult = bodyResult.replace(content, result);
            match = regexFunction.exec(content);
        }
        return bodyResult;
    }

    private evaluateFunctionArguments(argsText: string) {
        winston.debug("TemplateManager.evaluateFunctionArguments");
        const args : any[] = [];
        var match = regexFunctionArg.exec(argsText);
        while ( match != null && match.length > 1) {
            args.push(match[1] as string);
            match = regexFunctionArg.exec(argsText);
        }
        return args;
    }

    private async evaluateFunction(functionName: string, args: string[]) {
        winston.debug(util.format("TemplateManager.evaluateFunction: %s", functionName));
        if ( this._functions[functionName] ) {
            const value = await this._functions[functionName].apply(null, args);
            return value + "";
        } else {
            winston.warn(util.format("TemplateManager.evaluateFunction - Error undefined function %s", functionName));
            return util.format("Error undefined function %s", functionName);
        }
    }

    private evaluateRequests(body: string, context: Context) {
        winston.debug("TemplateManager.evaluateRequests");
        var bodyResult = body;
        var match = regexRequestData.exec(body);
        while ( match != null && match.length > 2) {
            const content = match[0];
            const propertyText = match[2];
            const result = this.evaluateRequest(propertyText, context.request?.body);
            bodyResult = bodyResult.replace(content, result);
            match = regexRequestData.exec(body);
        }
        return bodyResult;
    }

    private evaluateRequest(property: string, requestBody: {[id: string]: string}) {
        winston.debug(util.format("TemplateManager.evaluateRequest: %s", property));
        if ( requestBody[property] ) {
            return requestBody[property];
        } else {
            return "undefined";
        }
    }


    public static async uuid(context?: Context) {
        winston.debug("TemplateManager.uuid");
        const id = v4();
        winston.info(util.format("TemplateManager.uuid: New ID generated: %s", id));
        return id;
    }

    public static async uniqueId(context?: Context) : Promise<number> {
        winston.debug("TemplateManager.uniqueId");
        const id = new Date().toISOString().replace(/\-/g, "").replace(/:/g, "")
            .replace(/\./g, "").replace('T', '').replace('Z', '');
        winston.info(util.format("TemplateManager.uniqueId: New ID generated: %s", id));
        return Number.parseInt(id);
    }

    public static async increment(context: Context, key: string) {
        winston.debug("TemplateManager.increment");
        var value = await RedisManager.instance.getValue(key);
        if ( !value ) { value = "1"; }
        const currentValue = Number.parseInt(value);
        if ( !Number.isNaN(currentValue)) {
            await RedisManager.instance.setValue(key, (currentValue+1) + "");
        }
        return value;
    }

    private static async newIntegerId(context: Context) {
        winston.debug("TemplateManager.newIntegerId");
        if ( context.newIntegerId ) {
            return context.newIntegerId;
        } else {
            winston.warn("TemplateManager.newIntegerId - The context not correctly set before usage");
            return "undefined";
        }
    }

    private static async newUUID(context: Context) {
        winston.debug("TemplateManager.newUUID");
        if ( context.newUUID ) {
            return context.newUUID;
        } else {
            winston.warn("TemplateManager.newUUID - The context not correctly set before usage");
            return "undefined";
        }
    }

    public static get instance() {
        if ( !TemplateManager._instance) {
            TemplateManager._instance = new TemplateManager();
        }
        return TemplateManager._instance;
    }
}