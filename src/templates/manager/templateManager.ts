import * as util from "util";
import * as winston from "winston";
import * as fs from "fs";
import * as path from "path";
import { v4 } from "uuid";
import { RedisManager } from "./redisManager";
import { Context } from "../context";
import { XMLUtils } from "../util/XMLUtils";
// {{.imports}}

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
        this.registerExternalFunctions();
    }

    private registerFunction() {
        winston.debug("TemplateManager.registerFunction");
        this._functions["UUID"] = TemplateManager.uuid;
        this._functions["UniqueID"] = TemplateManager.uniqueId;
        this._functions["Increment"] = TemplateManager.increment;
        this._functions["CurrentDate"] = TemplateManager.currentDate;
        this._functions["RandomInteger"] = TemplateManager.randomInteger;
        this._functions["RandomString"] = TemplateManager.randomString;
        this._functions["UpperCase"] = TemplateManager.upperCase;
        this._functions["LowerCase"] = TemplateManager.lowerCase;
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

    private registerExternalFunctions() {
        winston.debug("TemplateManager.registerExternalFunctions");
        const instance = this;
        try {
            // {{.register}}
        } catch (err) {
            winston.error("TemplateManager.registerExternalFunctions - Internal error: ", err);
        }
    }

    public async evaluate(content: string, context: Context) {
        winston.debug("TemplateManager.evaluate");
        var bodyResult = content;

        try {

            // Apply functions
            bodyResult = await this.evaluateFunctions(content, context);

            // Evaluate requests
            bodyResult = this.evaluateRequests(bodyResult, context);

            // Apply context
            bodyResult = this.evaluateContext(bodyResult, context);

            // Apply storage
            bodyResult = await this.evaluateStorage(bodyResult, context);

            // Apply data
            bodyResult = this.evaluateDataSources(bodyResult, context);

        } catch ( err ) {
            winston.error("TemplateManager.evaluate - An internal error during the body evaluation: ", err);
            bodyResult = "An internal error during the body evaluation";
        }

        return bodyResult;
    }

    private async evaluateFunctions(content: string, context: Context) : Promise<string>{
        winston.debug("TemplateManager.evaluateFunctions");
        var bodyResult = content;
        const regexFunction = /{{\s*([a-zA-Z0-9|_]+)\s*(\(\s*([a-zA-Z0-9|_|{|}|\.]+(\s*,\s*[a-zA-Z0-9|_|{|}|\.]+)*)?\s*\)\s*)}}/g;
        var match = regexFunction.exec(content);
        if ( match && match.length > 2 ) {

            // Evaluate the data source
            const fullMatch = match[0];
            const functionName = match[1];
            const argumentsText = match[2];
            const result = await this.evaluateFunction(functionName, argumentsText, context);

            // Update the content 
            if ( result ) {
                bodyResult = bodyResult.replace(fullMatch, result);
                return await this.evaluateFunctions(bodyResult, context);
            } else {
                return bodyResult;
            }
        }
        return bodyResult;
    }

    private async evaluateFunctionArguments(content: string, context: Context) {
        winston.debug("TemplateManager.evaluateFunctionArguments");

        var args : any[] = [];
        const regexFunctionArg = /([a-zA-Z0-9|_|{|}|\.]+)/g;
        var match = regexFunctionArg.exec(content);
        if ( match && match.length > 1 ) {

            // Evaluate argument
            const argument = await this.evaluate(match[1], context)
            args.push(argument);
            const remaining = content.substring(argument.length);
            const remainingArguments = await this.evaluateFunctionArguments(remaining, context);
            if ( remainingArguments && remainingArguments.length > 0 ) {
                args = args.concat(remainingArguments);
            }
        }
        return args;
    }

    private async evaluateFunction(functionName: string, argumentsText: string, context: Context) {
        winston.debug(util.format("TemplateManager.evaluateFunction: %s", functionName));

        // Parse arguments
        const args = await this.evaluateFunctionArguments(argumentsText, context);
        args.unshift(context);

        // Call the function
        if ( this._functions[functionName] ) {
            try {
                const value = await this._functions[functionName].apply(null, args);
                return value + "";
            } catch (err) {
                winston.error("TemplateManager.evaluateFunction - Internal error during the function call: ", err);
                return "undefined";
            }
        } else {
            winston.warn(util.format("TemplateManager.evaluateFunction - Error undefined function %s", functionName));
            return "undefined";
        }
    }

    private evaluateRequests(content: string, context: Context) : string {
        winston.debug("TemplateManager.evaluateRequests");
        var bodyResult = content;
        const regexRequests = /{{\s*\.request\.([a-zA-Z0-9|_|\-|:|\.|\$]+)\s*}}/g;
        var match = regexRequests.exec(content);
        if ( match && match.length > 1 ) {

            // Evaluate the data source
            const fullMatch = match[0];
            const path = match[1];
            const result = this.evaluateRequest(path, context);

            // Update the content 
            if ( result ) {
                bodyResult = bodyResult.replace(fullMatch, result);
                return this.evaluateRequests(bodyResult, context);
            } else {
                return bodyResult;
            }
        }
        return bodyResult;
    }

    private evaluateRequest(path: string, context: Context) {
        winston.debug("TemplateManager.evaluateRequest");
        if ( context.isJSONRequest ) {
            return this.evaluateJSONRequest(path, context);
        } else if ( context.isXMLRequest ) {
            return this.evaluateXMLRequest(path, context);
        } else if ( path.startsWith("query") || path.startsWith("headers") || path.startsWith("params")) {
            return this.evaluateJSONRequest(path, context);
        } else {
            winston.warn("TemplateManager.evaluateRequest - Content Type not defined or not supported");
            return "undefined";
        }
    }

    private evaluateJSONRequest(path: string, context: Context) {
        winston.debug("TemplateManager.evaluateJSONRequest");
        if ( context.request ) {
            if ( path ) {
                const subPath = path.split(".");
                const pathRemaining = subPath.slice(1);
                switch (subPath[0]) {
                    case "query":
                        return this.evaluateJSONRequestPath(pathRemaining, context.request.query);
                    case "params":
                        return this.evaluateJSONRequestPath(pathRemaining, context.request.params);
                    case "headers":
                        return this.evaluateJSONRequestPath(pathRemaining, context.request.headers);
                    case "body":
                        return this.evaluateJSONRequestPath(pathRemaining, context.request.body);
                    default:
                        winston.warn("TemplateManager.evaluateJSONRequest - Path not correctly defined");
                        return "undefined";
                }
            } else {
                winston.warn("TemplateManager.evaluateJSONRequest - Path undefined");
                return "undefined";
            }
        } else {
            winston.warn("TemplateManager.evaluateJSONRequest - Request undefined");
            return "undefined";
        }
    }

    private evaluateJSONRequestPath(paths: string[], content: any) {
        winston.debug("TemplateManager.evaluateJSONRequestPath");
        if ( paths && paths.length > 0) {
            if ( content ) {
                var currentElement = content;
                for ( var i = 0; i < paths.length; i++) {
                    if ( currentElement[paths[i]]) {
                        currentElement = currentElement[paths[i]];
                    } else {
                        winston.warn(util.format("TemplateManager.evaluateJSONRequestPath - Path not correctly defined: %s", paths[i]));
                        return "undefined";
                    }
                }
                return currentElement as string;
            } else {
                winston.warn("TemplateManager.evaluateJSONRequestPath - Invalid content");
                return "undefined";
            }
        } else {
            winston.warn("TemplateManager.evaluateJSONRequestPath - Paths not correctly defined");
            return "undefined";
        }
    }

    private evaluateXMLRequest(path: string, context: Context) {
        winston.debug("TemplateManager.evaluateXMLRequest");
        if ( context.request ) {
            if ( path ) {
                const subPath = path.split(".");
                const pathRemaining = subPath.slice(1);
                switch (subPath[0]) {
                    case "query":
                        return this.evaluateJSONRequestPath(pathRemaining, context.request.query);
                    case "params":
                        return this.evaluateJSONRequestPath(pathRemaining, context.request.params);
                    case "headers":
                        return this.evaluateJSONRequestPath(pathRemaining, context.request.headers);
                    case "body":
                        return this.evaluateXMLRequestPath(pathRemaining, context.request.body, XMLUtils.getNodeValue);
                    case "soapHeaders":
                        return this.evaluateXMLRequestPath(pathRemaining, context.request.body, XMLUtils.getSoapHeaderNodeValue);
                    case "soapBody":
                        return this.evaluateXMLRequestPath(pathRemaining, context.request.body, XMLUtils.getSoapBodyNodeValue);
                    default:
                        winston.warn("TemplateManager.evaluateXMLRequest - Path not correctly defined");
                        return "undefined";
                }
            } else {
                winston.warn("TemplateManager.evaluateXMLRequest - Path undefined");
                return "undefined";
            }
        } else {
            winston.warn("TemplateManager.evaluateXMLRequest - Request undefined");
            return "undefined";
        }
    }

    private evaluateXMLRequestPath(paths: string[], content: any, getNodeValue: Function) {
        winston.debug("TemplateManager.evaluateXMLRequestPath");
        if ( paths && paths.length > 0) {
            if ( content ) {
                const result = getNodeValue.apply(null, [content, paths]);
                if ( result ) {
                    return result;
                } else {
                    winston.warn(util.format("TemplateManager.evaluateXMLRequestPath - Impossible to navigate throught the path: %s", paths.join(".")));
                    return "undefined";
                }
            } else {
                winston.warn("TemplateManager.evaluateXMLRequestPath - Invalid content");
                return "undefined";
            }
        } else {
            winston.warn("TemplateManager.evaluateXMLRequestPath - Paths not correctly defined");
            return "undefined";
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
    }

    private evaluateDataSource(path: string, context: Context) {
        winston.debug("TemplateManager.evaluateDataSource: " + path);
        if ( path ) {
            const subpaths = path.split(".");
            if ( subpaths.length == 1 ) {
                return this.randomValueFromDataSource(subpaths[0]) + "";
            } else if ( subpaths.length > 1 ) {

                // Identify datasource
                var dataSource;
                if ( !context.dataSources[subpaths[0]]) {
                    dataSource = this.randomValueFromDataSource(subpaths[0]) as object;
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

    private randomValueFromDataSource(dataSourceName: string) {
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

    private evaluateContext(content: string, context: Context) {
        winston.debug("TemplateManager.evaluateContext");
        const regex = /{{\s*\.ctx\.([a-zA-Z0-9|_|\.]+)\s*}}/g;        
        var match = regex.exec(content);
        if ( match && match.length > 1 ) {
            const fullMatch = match[0];
            const pathText = match[1];
            const paths = pathText.split(".");
            const result = TemplateManager.navigateThroughtObject(context.data, paths);
            content = content.replace(fullMatch, result);
            content = this.evaluateContext(content, context);
        }
        return content;
    }

    private async evaluateStorage(content: string, context: Context) {
        winston.debug("TemplateManager.evaluateStorage");
        const regex = /{{\s*\.store\.([a-zA-Z0-9|_]+)\[([a-zA-Z0-9|,\s|{|}|\.]+)\]([\.a-zA-Z0-9|_]+)\s*}}/g;
        var match = regex.exec(content);
        if ( match && match.length > 3 ) {
            const fullMatch = match[0];
            const storageText = match[1];
            const keyText = await TemplateManager.instance.evaluate(match[2], context);
            const propertyText = match[3];
            if (propertyText.trim().startsWith(".")) {
                const key = TemplateManager.determineKey(storageText, keyText);
                const dataText = await RedisManager.instance.getValue(key);
                const data = JSON.parse(dataText);
                const paths = TemplateManager.determinePath(propertyText);
                const result = TemplateManager.navigateThroughtObject(data, paths);
                content = content.replace(fullMatch, result);
                content = await this.evaluateStorage(content, context);
            }
        }

        return content;
    }

    private static determineKey(storageText: string, keyText: string) {
        var key = storageText + "$$";
        keyText.split(",").forEach(k => {
            key += k.trim() + "$$";
        });
        key = key.substring(0, key.length - 2);
        return key;
    }

    private static determinePath(propertyText: string) {
        propertyText = propertyText.trim().substring(1);
        return propertyText.split(".");
    }

    private static navigateThroughtObject(data: any, paths: string[]) {
        var currentElement = data;
        for ( var i = 0; i < paths.length; i++) {
            if ( data[paths[i]]) {
                currentElement = data[paths[i]];
            } else {
                return "undefined";
            }
        }
        return currentElement;
    }
 
    public static async uuid(context?: Context) {
        winston.debug("TemplateManager.uuid");
        const id = v4();
        winston.info(util.format("TemplateManager.uuid: New ID generated: %s", id));
        if ( context ) {
            Object.defineProperty(context.data, "lastUUID", { value: id });
        }
        return id;
    }

    public static async uniqueId(context?: Context) : Promise<number> {
        winston.debug("TemplateManager.uniqueId");
        const id = new Date().toISOString().replace(/\-/g, "").replace(/:/g, "")
            .replace(/\./g, "").replace('T', '').replace('Z', '');
        winston.info(util.format("TemplateManager.uniqueId: New ID generated: %s", id));
        if ( context ) {
            Object.defineProperty(context.data, "lastUniqueID", { value: id });
        }
        return Number.parseInt(id);
    }

    public static async increment(context: Context, key: string) {
        winston.debug("TemplateManager.increment");
        var value = await RedisManager.instance.getValue(key);
        if ( !value ) { value = "1"; }
        const currentValue = Number.parseInt(value);
        if ( !Number.isNaN(currentValue)) {
            await RedisManager.instance.setValue(key, (currentValue+1) + "");
            if ( context ) {
                Object.defineProperty(context.data, "lastIncrement", { value: value });
                Object.defineProperty(context.data, "increment" + key, { value: value });
            }
        }
        return value;
    }

    public static async randomInteger(context: Context, maxValue: number) {
        winston.debug("TemplateManager.random: " + maxValue);
        return TemplateManager._random(maxValue);
    }
    private static _random(maxValue: number) {
        return Math.round(Math.random() * maxValue);
    }

    private static currentDate(context: Context) {
        winston.debug("TemplateManager.currentDate");
        return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    }

    private static randomString(context: Context) {
        winston.debug("TemplateManager.randomString");
        return TemplateManager.instance.randomValueFromDataSource("words");
    }

    private static upperCase(context: string, content: string) {
        winston.debug("TemplateManager.upperCase");
        if ( content ) {
            return content.toUpperCase();
        } else {
            winston.warn("TemplateManager.upperCase - upperCase function require one parameter");
            return "undefined";
        }
    }

    private static lowerCase(context: string, content: string) {
        winston.debug("TemplateManager.lowerCase");
        if ( content ) {
            return content.toLowerCase();
        } else {
            winston.warn("TemplateManager.lowerCase - lowerCase function require one parameter");
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