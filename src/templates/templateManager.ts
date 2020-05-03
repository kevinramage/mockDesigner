import * as util from "util";
import * as winston from "winston";
import * as fs from "fs";
import * as path from "path";
import { v4 } from "uuid";
import { RedisManager } from "./redisManager";
import { Context } from "./context";
import { XMLUtils } from "./XMLUtils";

// Function
const regexFunction = /{{([a-zA-Z0-9|_]+)\s*(\(\s*([a-zA-Z0-9|_]+(\s*,\s*[a-zA-Z0-9|_]+)*)?\s*\)\s*)}}/g;
const regexFunctionArg = /([a-zA-Z0-9|_]+)/g;

// Request
const regexRequestData = /{{\.([a-z|A-Z|0-9|_]+)\.([a-z|A-Z|0-9|_]+)}}/g;
const regexRequestXML = /{{\s*\.request\.([a-zA-Z0-9|_|-|:|\.]+)\s*}}/g;


export module DATASOURCE_NAME {
    export const FIRSTNAME = "firstname";
    export const LASTNAME = "lastname";
}

export class TemplateManager {
    private static _instance : TemplateManager;
    private _functions : {[functionName: string]: Function};
    private _dataSources : {[functionName: string]: object[]};

    private constructor() {
        this._functions = {};
        this._dataSources = {};
    }

    public init() {
        this.registerFunction();
        this.registerDataSources();
    }

    private registerFunction() {
        winston.debug("TemplateManager.registerFunction");
        this._functions["UUID"] = TemplateManager.uuid;
        this._functions["UniqueID"] = TemplateManager.uniqueId;
        this._functions["Increment"] = TemplateManager.increment;
        this._functions["NewIntegerId"] = TemplateManager.newIntegerId;
        this._functions["NewUUID"] = TemplateManager.newUUID;
        this._functions["Random"] = TemplateManager.random;
    }

    private registerDataSources() {
        winston.debug("TemplateManager.registerDataSources");
        const instance = this;
        try {
            fs.readdirSync("data").forEach(file => {
                if ( file.endsWith(".json")) {
                    try {
                        const fileName = path.basename(file, ".json");
                        const fileUri = path.join("data", file);
                        const content = fs.readFileSync(fileUri);
                        const data = JSON.parse(content.toString());
                        instance._dataSources[fileName] = data as object[];
                    } catch ( err ) {
                        winston.error("TemplateManager.registerDataSources - Error during the datasource reading ", err);
                    }
                }
            });
        } catch (err) {
            winston.error("TemplateManager.registerDataSources - Error during the datasource directory reading ", err);
        }
    }

    public async evaluate(content: string, context: Context) {
        winston.debug("TemplateManager.evaluate");
        var bodyResult = content;

        // Apply functions
        bodyResult = await this.evaluateFunctions(content, context);

        // Evaluate requests
        bodyResult = this.evaluateRequests(bodyResult, context);

        // Apply properties

        // Apply scripts

        // Apply data
        bodyResult = this.evaluateDataSources(bodyResult, context);

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
            match = regexFunction.exec(bodyResult);
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

    private evaluateRequests(content: string, context: Context) {
        winston.debug("TemplateManager.evaluateRequests");
        if ( context.isJSONRequest ) {
            return content = this.evaluateJSONRequests(content, context);
        } else if ( context.isXMLRequest ) {
            return content = this.evaluateXMLRequests(content, context);
        } else {
            return content;
        }
    }

    private evaluateJSONRequests(body: string, context: Context) {
        winston.debug("TemplateManager.evaluateJSONRequests");
        var bodyResult = body;
        var match = regexRequestData.exec(body);
        while ( match != null && match.length > 2) {
            const content = match[0];
            const propertyText = match[2];
            const result = this.evaluateJSONRequest(propertyText, context.request?.body);
            bodyResult = bodyResult.replace(content, result);
            match = regexRequestData.exec(body);
        }
        return bodyResult;
    }

    private evaluateJSONRequest(property: string, requestBody: {[id: string]: string}) {
        winston.debug(util.format("TemplateManager.evaluateRequest: %s", property));
        if ( requestBody[property] ) {
            return requestBody[property];
        } else {
            return "undefined";
        }
    }

    private evaluateXMLRequests(content: string, context: Context) {
        winston.debug("TemplateManager.evaluateXMLRequests");
        var bodyResult = content;
        var match = regexRequestXML.exec(content);
        while ( match != null && match.length > 1) {
            const content = match[0];
            const path = match[1];
            const result = this.evaluateXMLRequest(path, context.request?.body);
            if ( result != null ) {
                bodyResult = bodyResult.replace(content, result);
            }
            match = regexRequestXML.exec(bodyResult);
        }
        return bodyResult;
    }

    private evaluateXMLRequest(path: string, requestBody: any) {
        winston.debug("TemplateManager.evaluateXMLRequest");
        if ( requestBody ) {
            return XMLUtils.getValue(requestBody, path);
        } else {
            return null;
        }
    }

    private evaluateDataSources(content: string, context: Context) : string{
        winston.debug("TemplateManager.evaluateDataSources");
        var bodyResult = content;
        const regexData = /{{\s*\.data\.([a-zA-Z0-9|_|-|\.]+)\s*}}/g;
        var match = regexData.exec(bodyResult);
        if ( match && match.length > 1 ) {

            // Evaluate the data source
            const fullMatch = match[0];
            const path = match[1];
            const result = this.evaluateDataSource(path, context);

            // Update the content 
            if ( result ) {
                bodyResult = bodyResult.replace(fullMatch, result);
                return this.evaluateDataSources(bodyResult, context);
            } else {
                return bodyResult;
            }
        }
        return bodyResult;

        /*
        while ( match != null && match.length > 1) {
            const content = match[0];
            const path = match[1];
            const result = this.evaluateDataSource(path, context);
            if ( result != null ) {
                bodyResult = bodyResult.replace(content, result);
            }
            match = regexData.exec(bodyResult);
        }
        return bodyResult;
        */
    }

    private evaluateDataSource(path: string, context: Context) {
        winston.debug("TemplateManager.evaluateDataSource: " + path);
        if ( path ) {
            const subpaths = path.split(".");
            if ( subpaths.length == 1 ) {
                return this.randomDataSource(subpaths[0]) + "";
            } else if ( subpaths.length > 1 ) {

                // Identify datasource
                var dataSource;
                if ( !context.dataSources[subpaths[0]]) {
                    dataSource = this.randomDataSource(subpaths[0]) as object;
                    context.dataSources[subpaths[0]] = dataSource;
                } else {
                    dataSource = context.dataSources[subpaths[0]];
                }

                // Navigate through the object
                var currentElement : any = dataSource;
                for ( var i = 1; i < subpaths.length; i++) {
                    if ( currentElement ) {
                        currentElement = currentElement[subpaths[i]];
                    } else {
                        winston.warn(util.format("TemplateManager.evaluateDataSource: %s - Impossible to navigate throught undefined element (Previous element %s)", path, subpaths[i-1]));
                        return "undefined";
                    }
                }

                if ( currentElement ) {
                    return currentElement as string;
                } else {
                    winston.warn(util.format("TemplateManager.evaluateDataSource: %s - Impossible to navigate throught undefined element (Previous element %s)", path, subpaths[subpaths.length-1]));
                    return "undefined";
                }
            }
        } else {
            winston.warn(util.format("TemplateManager.evaluateDataSource: %s - Impossible to evaluate undefined path"));
            return "undefined";
        }
    }

    private randomDataSource(dataSourceName: string) {
        winston.debug("TemplateManager.randomDataSource: " + dataSourceName);
        try {
            const dataSource = TemplateManager.instance._dataSources[dataSourceName];
            if ( dataSource ) {
                const length = dataSource.length;
                const index = TemplateManager._random(length);
                return dataSource[index];
            } else {
                winston.warn("TemplateManager.randomDataSource - Datasource not exists: " + dataSourceName);    
                return "undefined";
            }
        } catch (err) {
            winston.warn("TemplateManager.randomDataSource - Error during the access of datasource " + dataSourceName, err);
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

    public static async random(context: Context, maxValue: number) {
        winston.debug("TemplateManager.random: " + maxValue);
        return TemplateManager._random(maxValue);
    }
    private static _random(maxValue: number) {
        return Math.trunc(Math.random() * maxValue);
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