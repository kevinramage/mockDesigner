import * as util from "util";
import * as winston from "winston";
import { v4 } from "uuid";
import { Request } from "express";
import { RedisManager } from "./redisManager";

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
        this._functions["UUID"] = this.uuid;
        this._functions["UniqueID"] = this.uniqueId;
        this._functions["Increment"] = this.increment;
    }

    public async evaluate(body: string, req?: Request) {
        winston.debug("TemplateManager.evaluate");
        var bodyResult = body;

        // Apply functions
        bodyResult = await this.evaluateFunctions(bodyResult);

        // Evaluate requests
        if ( req ) {
            bodyResult = this.evaluateRequests(bodyResult, req.body);
        }

        // Apply properties

        // Apply data

        return bodyResult;
    }

    private async evaluateFunctions(body: string) {
        winston.debug("TemplateManager.evaluateFunctions");
        var bodyResult = body;
        var match = regexFunction.exec(body);
        while ( match != null && match.length > 2) {
            const content = match[0];
            const functionName = match[1];
            const argumentsText = match[2];
            const args = this.evaluateFunctionArguments(argumentsText);
            const result = await this.evaluateFunction(functionName, args);
            bodyResult = bodyResult.replace(content, result);
            match = regexFunction.exec(body);
        }
        return bodyResult;
    }

    private evaluateFunctionArguments(argsText: string) {
        winston.debug("TemplateManager.evaluateFunctionArguments");
        const args : string[] = [];
        var match = regexFunctionArg.exec(argsText);
        while ( match != null && match.length > 1) {
            args.push(match[1]);
            match = regexFunctionArg.exec(argsText);
        }
        return args;
    }

    private async evaluateFunction(functionName: string, args: string[]) {
        winston.debug("TemplateManager.evaluateFunction");
        if ( this._functions[functionName] ) {
            return await this._functions[functionName].call(this, args);
        } else {
            return util.format("Error undefined function %s", functionName);
        }
    }

    private evaluateRequests(body: string, requestBody: any) {
        winston.debug("TemplateManager.evaluateRequests");
        var bodyResult = body;
        var match = regexRequestData.exec(body);
        while ( match != null && match.length > 2) {
            console.info(match);
            const content = match[0];
            const propertyText = match[2];
            const result = this.evaluateRequest(propertyText, requestBody);
            bodyResult = bodyResult.replace(content, result);
            match = regexRequestData.exec(body);
        }
        return bodyResult;
    }

    private evaluateRequest(property: string, requestBody: {[id: string]: string}) {
        console.info(property);
        if ( requestBody[property] ) {
            return requestBody[property];
        } else {
            return "undefined";
        }
    }


    private async uuid() {
        winston.debug("TemplateManager.uuid");
        return v4();
    }

    private async uniqueId() {
        winston.debug("TemplateManager.uniqueId");
        return new Date().toISOString().replace(/\-/g, "").replace(/:/g, "")
            .replace(/\./g, "").replace('T', '').replace('Z', '');
    }

    private async increment(key: string) {
        winston.debug("TemplateManager.increment");
        var value = await RedisManager.instance.getValue(key);
        if ( !value ) { value = "1"; }
        const currentValue = Number.parseInt(value);
        if ( !Number.isNaN(currentValue)) {
            await RedisManager.instance.setValue(key, (currentValue+1) + "");
        }
        return value;
    }

    public static get instance() {
        if ( !TemplateManager._instance) {
            TemplateManager._instance = new TemplateManager();
        }
        return TemplateManager._instance;
    }
}