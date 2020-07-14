import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import * as util from "util";
import * as winston from "winston";
import * as colors from "colors";
import { IMock } from "../interface/mock";
import { Mock } from "../business/mock";
import { MockFactory } from "../factory/mockFactory";
import { ERRORS, HTTP_METHODS, WARNING, AUTHENTICATION_TYPE } from "../constantes";
import { IMockService } from "../interface/mockService";
import { IMockResponse } from "../interface/mockResponse";
import { IMockAction } from "../interface/mockAction";
import { IMockMessageAction } from "../interface/mockMessageAction";
import { IMockSaveAction } from "../interface/mockSaveAction";
import { IMockTrigger } from "../interface/mockTrigger";
import { IMockDataTriger } from "../interface/mockDataTrigger";
import { IMockAuthentication } from "interface/mockAuthentication";
import { IMockRandomTrigger } from "interface/mockRandomTrigger";
import { IMockSequentialTrigger } from "interface/mockSequentialTrigger";
import { IMockValidationTrigger } from "interface/mockValidationTrigger";
import { IMockWaitAction } from "interface/mockWaitAction";
import { IMockMicroServiceAction } from "interface/mockMicroServiceAction";
import { IMockBasicAuthentication } from "interface/mockBasicAuthentication";
import { IMockApiKeyAuthentication } from "interface/mockApiKeyAuthentication";

export class ValidationError extends Error {
    private _errors : string[];
    private _warnings : string[];

    constructor(message: string, errors: string[], warnings: string[]) {
        super(message);
        this._errors = errors;
        this._warnings = warnings;
    }

    public get errors() { return this._errors; }
    public get warnings() { return this._warnings; }
}

export class MockDesigner {

    private _mockInterface : IMock | undefined;
    private _mock : Mock | undefined;

    public read(path: string) {
        winston.debug(util.format("MockDesigner.read: %s"), path);
        if ( fs.existsSync(path) ) {
            if  ( fs.lstatSync(path).isFile() ) {
                var buffer, yamlObject;
                try {
                    buffer = fs.readFileSync(path);
                } catch ( err ) {
                    throw new Error(ERRORS.FAIL_READFILE);
                }

                // Parse the file
                const body = this.proceedIncludes(path, buffer.toString());
                yamlObject = yaml.parse(body);
                this._mockInterface = yamlObject as IMock;

                // Validate the mock
                const data = this.validate(this._mockInterface);
                data.warnings.forEach(warn => {
                    console.warn(colors.yellow("WARNING: " + warn));
                });
                if ( data.errors.length > 0 ) {
                    throw new ValidationError("A validation error occured", data.errors, data.warnings);
                }

                // Use the factory to build business object
                this._mock = MockFactory.build(this._mockInterface);

                // Save the source code
                this._mock.sourceCode = body;
            } else {
                throw new Error(ERRORS.INVALID_INPUTDIR_ISDIRECTORY);
            }
        } else {
            throw new Error(ERRORS.INVALID_INPUTDIR_FILENOTEXISTS);
        }
    }

    private proceedIncludes(path: string, content: string) : string {
        const regexInclude = /(\s*)##INCLUDE\s*([a-zA-Z0-9|\.|_|\-]+)\s*##/g;
        var result = content;
        var match = regexInclude.exec(content);
        if ( match && match.length > 1 ) {

            // Extract variables
            var space = "", includePath = "";
            const fullMatch = match[0];
            if (  match.length > 2 ) {
                space = match[1];
                includePath = match[2];
            } else {
                includePath = match[1];
            }

            // Proceed inclusion
            const includeCode = this.proceedInclude(path, space, includePath);
            result = result.replace(fullMatch, includeCode);
            return this.proceedIncludes(path, result);
        }
        return result;
    }

    private proceedInclude(pathName: string, space: string, includePath: string) {
        const dirname = path.dirname(pathName);
        const buffer = fs.readFileSync(path.join(dirname, includePath));
        var result = buffer.toString();
        return result.replace(/\r/g, "").split("\n").map(line => {
            return space + line;
        }).join("\n");
    }


    private validate(mock: IMock) {
        winston.debug("MockDesigner.validate");
        var validationErrors : string[] = [];
        var validationWarnings : string[] = [];
        
        // Name
        if ( !mock.name ) { validationErrors.push(ERRORS.MOCKNAME_MISSING); }
        else if ( typeof(mock.name) != "string") { 
            validationErrors.push(ERRORS.MOCKNAME_MISSING); 
        }

        // Services
        if ( !mock.services ) { validationErrors.push(ERRORS.MOCKSERVICES_MISSING); }
        else if ( !mock.services.length ) { 
            validationErrors.push(ERRORS.MOCKSERVICES_MISSING); 
        }
        else if ( mock.services.length == 0 ) {
            validationErrors.push(ERRORS.MOCKSERVICES_ATLEASTONE);
        }
        if ( mock.services ) {
            const servicesName : string[] = [];
            const instance = this;
            mock.services.forEach(service => {
                instance.validateService(service, validationErrors, validationWarnings);
                if ( service.name ) {
                    if ( servicesName.includes(service.name)) {
                        validationErrors.push(util.format(ERRORS.SERVICENAME_ALREADYEXISTS, service.name));
                    }
                    servicesName.push(service.name);
                }
            });
        }

        return {
            "errors": validationErrors,
            "warnings": validationWarnings
        };
    }

    private validateService(mockService: IMockService, validationErrors: string[], validationWarnings: string[]) {

        // Name
        if ( !mockService.name ) { validationErrors.push(ERRORS.SERVICENAME_MISSING); }
        else if ( typeof mockService.name != "string" ) { validationErrors.push(ERRORS.SERVICENAME_MISSING); }

        // Method (GET, POST, PUT, DELETE)
        if ( mockService.method ) {
            const methods = [ HTTP_METHODS.CONNECT, HTTP_METHODS.DELETE, HTTP_METHODS.GET, HTTP_METHODS.HEAD, HTTP_METHODS.OPTIONS, HTTP_METHODS.PATCH, HTTP_METHODS.POST, HTTP_METHODS.PUT, HTTP_METHODS.TRACE];
            const method = mockService.method.toUpperCase();
            if ( !methods.includes(method) ) {
                validationErrors.push(ERRORS.SERVICEMETHOD_INVALID);
            }
        } else {
            validationWarnings.push(WARNING.SERVICEMETHOD_MISSING);
        }

        // Path
        if ( !mockService.path ) {
            validationWarnings.push(WARNING.SERVICEPATH_MISSING);
        }

        // Authentication
        if ( mockService.authentication ) {

            // Type
            const types = [ AUTHENTICATION_TYPE.APIKEY_AUTHENTICATION, AUTHENTICATION_TYPE.BASIC_AUTHENTICATION ];
            if ( !mockService.authentication.type || typeof (mockService.authentication.type) != "string") {
                validationErrors.push(ERRORS.AUTHENTICATIONTYPE_MISSING);
            } else if (!types.includes((mockService.authentication.type as string).toUpperCase())) {
                validationErrors.push(ERRORS.AUTHENTICATIONTYPE_INVALID);
            } else {
                this.validateAuthentication(mockService.authentication, validationErrors, validationWarnings);
            }
        }

        // Response
        if ( !mockService.response ) { validationErrors.push(ERRORS.SERVICERESPONSE_MISSING); }
        else if ( typeof mockService.response != "object" ) { validationErrors.push(ERRORS.SERVICERESPONSE_MISSING); }
        else { this.validateResponse(mockService.response, validationErrors, validationWarnings); }
    }

    private validateAuthentication(authentication: IMockAuthentication, validationErrors: string[], validationWarnings: string[]) {
        switch ( authentication.type ) {
            case AUTHENTICATION_TYPE.BASIC_AUTHENTICATION:
                this.validateBasicAuthentication(authentication as IMockBasicAuthentication, validationErrors, validationWarnings);
            break;
            case AUTHENTICATION_TYPE.APIKEY_AUTHENTICATION:
                this.validateApiKeyAuthentication(authentication as IMockApiKeyAuthentication, validationErrors, validationWarnings);
            break;
        }
    }

    private validateBasicAuthentication(authentication: IMockBasicAuthentication, validationErrors: string[], validationWarnings: string[]) {

        // Username
        if ( !authentication.userName) { validationErrors.push(ERRORS.BASICAUTHENTICATIONUSERNAME_MISSING); }

        // Password
        if ( !authentication.password) { validationErrors.push(ERRORS.BASICAUTHENTICATIONPASSWORD_MISSING); }

    }

    private validateApiKeyAuthentication(authentication: IMockApiKeyAuthentication, validationErrors: string[], validationWarnings: string[]) {

        // Source
        const sources = [ "HEADER", "QUERY"]
        if ( !authentication.source ) { validationErrors.push(ERRORS.APIKEYAUTHENTICATIONSOURCE_MISSING); }
        else if ( !sources.includes(authentication.source.toUpperCase())) { validationErrors.push(ERRORS.APIKEYAUTHENTICATIONSOURCE_INVALID); }

        // KeyName
        if ( !authentication.keyName ) { validationErrors.push(ERRORS.APIKEYAUTHENTICATIONKEYNAME_MISSING); }

        // KeyValue
        if ( !authentication.keyValue ) { validationErrors.push(ERRORS.APIKEYAUTHENTICATIONKEYVALUE_MISSING); }
    }

    private validateResponse(mockResponse: IMockResponse, validationErrors: string[], validationWarnings: string[]) {

        // Triggers
        if ( mockResponse.triggers ) {
            const instance = this;
            mockResponse.triggers.forEach(trigger => {
                instance.validateTrigger(trigger, validationErrors, validationWarnings);
            });
        } else {
            validationErrors.push(ERRORS.RESPONSETRIGGERS_MISSING);
        }
    }

    private validateTrigger(mockTrigger: IMockTrigger, validationErrors: string[], validationWarnings: string[]) {

        // Type
        const triggerType = [ "data", "random", "sequential", "validate", "none"];
        if ( !mockTrigger.type ) { validationErrors.push(ERRORS.TRIGGERTYPE_MISSING); }
        else if ( !triggerType.includes(mockTrigger.type.toLowerCase()) ) { validationErrors.push(ERRORS.TRIGGERTYPE_INVALID); }
        else {
            switch ( mockTrigger.type.toLowerCase() ) {
                case "data":
                    this.validateDataTrigger(mockTrigger as IMockDataTriger, validationErrors, validationWarnings);
                break;
                case "random":
                    this.validateRandomTrigger(mockTrigger as IMockRandomTrigger, validationErrors, validationWarnings);
                break;
                case "sequential":
                    this.validateSequentialTrigger(mockTrigger as IMockSequentialTrigger, validationErrors, validationWarnings);
                break;
                case "validate":
                    this.validateValidateTrigger(mockTrigger as IMockValidationTrigger, validationErrors, validationWarnings);
                break;
                case "none":
                    this.validateNoTrigger(mockTrigger, validationErrors, validationWarnings);
                break;
            }

            
        }
    }

    private validateDataTrigger(mockDataTrigger: IMockDataTriger, validationErrors: string[], validationWarnings: string[]) {
        
        // Conditions
        if ( !mockDataTrigger.conditions ) { validationErrors.push(ERRORS.DATATRIGGERCONDITIONS_MISSING); }
        else if ( !mockDataTrigger.conditions.length ) { validationErrors.push(ERRORS.DATATRIGGERCONDITIONS_MISSING); }
        else if ( mockDataTrigger.conditions.length == 0 ) { validationErrors.push(ERRORS.DATATRIGGERCONDITIONS_ATLEASTONE); }

        // Actions
        if ( !mockDataTrigger.actions ) { validationErrors.push(ERRORS.TRIGGERACTIONS_MISSING); }
        else if ( !mockDataTrigger.actions.length ) { validationErrors.push(ERRORS.TRIGGERACTIONS_MISSING); }
        else if ( mockDataTrigger.actions.length == 0 ) { validationErrors.push(ERRORS.TRIGGERACTIONS_ATLEASTONE); } 
        this.validateActions(mockDataTrigger.actions, validationErrors, validationWarnings);
    }

    private validateRandomTrigger(mockRandomTrigger: IMockRandomTrigger, validationErrors: string[], validationWarnings: string[]) {

        // Messages
        mockRandomTrigger.messages.forEach(msg => {

            // Probability
            if ( !msg.probability ) {
                validationErrors.push(ERRORS.RANDOMTRIGGERPROBABILITY_MISSING);
            }

            // Actions
            if ( !msg.actions ) { validationErrors.push(ERRORS.TRIGGERACTIONS_MISSING); }
            else if ( !msg.actions.length ) { validationErrors.push(ERRORS.TRIGGERACTIONS_MISSING); }
            else if ( msg.actions.length == 0 ) { validationErrors.push(ERRORS.TRIGGERACTIONS_ATLEASTONE); } 
            this.validateActions(msg.actions, validationErrors, validationWarnings);
        });
    }

    private validateSequentialTrigger(mockSequentialTrigger: IMockSequentialTrigger, validationErrors: string[], validationWarnings: string[]) {

        // Messages
        mockSequentialTrigger.messages.forEach(msg => {

            // Actions
            if ( !msg.actions ) { validationErrors.push(ERRORS.TRIGGERACTIONS_MISSING); }
            else if ( !msg.actions.length ) { validationErrors.push(ERRORS.TRIGGERACTIONS_MISSING); }
            else if ( msg.actions.length == 0 ) { validationErrors.push(ERRORS.TRIGGERACTIONS_ATLEASTONE); } 
            this.validateActions(msg.actions, validationErrors, validationWarnings);
        });
    }

    private validateValidateTrigger(mockValidateTrigger: IMockValidationTrigger, validationErrors: string[], validationWarnings: string[]) {

        // Mandatories fields
        if ( !mockValidateTrigger.mandatoriesFields ) {
            validationErrors.push(ERRORS.VALIDATETRIGGERMANDATORIESFIELDS_MISSING);
        } else if ( !mockValidateTrigger.mandatoriesFields.length ) {
            validationErrors.push(ERRORS.VALIDATETRIGGERMANDATORIESFIELDS_MISSING);
        } else if ( mockValidateTrigger.mandatoriesFields.length == 0) {
            validationErrors.push(ERRORS.VALIDATETRIGGERMANDATORIESFIELDS_ATLEASTONE);
        }
        
        // Actions
        this.validateActions(mockValidateTrigger.actions, validationErrors, validationWarnings);
    }

    private validateNoTrigger(mockTrigger: IMockTrigger, validationErrors: string[], validationWarnings: string[]) {
        this.validateActions(mockTrigger.actions, validationErrors, validationWarnings);
    }

    private validateActions(actions: IMockAction[], validationErrors: string[], validationWarnings: string[]) { 

        // Actions
        if ( actions ) {
            const instance = this;
            actions.forEach(action => {
                instance.validateAction(action, validationErrors, validationWarnings);
            });
        }
    }


    private validateAction(mockAction: IMockAction, validationErrors: string[], validationWarnings: string[]) {

        // Type
        const actions = [ "message", "save", "wait", "microservice"];
        if ( !mockAction.type ) { validationErrors.push(ERRORS.ACTIONTYPE_MISSING); }
        else if ( typeof mockAction.type != "string" ) { validationErrors.push(ERRORS.ACTIONTYPE_MISSING); }
        else if ( !actions.includes(mockAction.type.toLowerCase() )) {
            validationErrors.push(ERRORS.ACTIONTYPE_INVALID);
        } else {
            switch ( mockAction.type ) {
                case "message":
                    this.validateMessageAction(mockAction as IMockMessageAction, validationErrors, validationWarnings);
                break;
                case "save":
                    this.validateSaveAction(mockAction as IMockSaveAction, validationErrors, validationWarnings);
                break;
                case "wait":
                    this.validateWaitAction(mockAction as IMockWaitAction, validationErrors, validationWarnings);
                    break;
                case "microservice":
                    this.validateMicroserviceAction(mockAction as IMockMicroServiceAction, validationErrors, validationWarnings);
                    break;
            }
        }
    }

    private validateMessageAction(mockAction: IMockMessageAction, validationErrors: string[], validationWarnings: string[]) {

        // Body
        if ( mockAction.body && mockAction.bodyFile ) {
            validationErrors.push(ERRORS.MESSAGEACTIONBODY_DEFINED2TIMES);
        }

    }

    private validateSaveAction(mockAction: IMockSaveAction, validationErrors: string[], validationWarnings: string[]) {


        // Expressions
        if ( !mockAction.expressions ) { validationErrors.push(ERRORS.SAVEACTIONSEXPRESSIONS_MISSING); }
        else if ( typeof mockAction.expressions != "object" || !mockAction.expressions.length ) { validationErrors.push(ERRORS.SAVEACTIONSEXPRESSIONS_MISSING); }
        else if ( mockAction.expressions.length == 0 ) {
            validationErrors.push(ERRORS.SAVEACTIONSEXPRESSIONS_ATLEASTONE);
        }

        // Storage
        if ( !mockAction.storage ) { validationErrors.push(ERRORS.SAVEACTIONSTORAGE_MISSING); }
        else if ( typeof mockAction.storage != "string" ) { validationErrors.push(ERRORS.SAVEACTIONSTORAGE_MISSING); } 

        // Keys
        if ( !mockAction.keys ) { validationErrors.push(ERRORS.SAVEACTIONSKEYS_MISSING); }
        else if ( typeof mockAction.keys != "object" || !mockAction.expressions.length ) { validationErrors.push(ERRORS.SAVEACTIONSKEYS_MISSING); }
        else if ( mockAction.keys.length == 0 ) {
            validationErrors.push(ERRORS.SAVEACTIONSKEYS_ATLEASTONE);
        }

    }

    private validateWaitAction(mockAction: IMockWaitAction, validationErrors: string[], validationWarnings: string[] ) {

        // Time
        if ( !mockAction.time ) { validationErrors.push(ERRORS.WAITACTIONTIMEOUT_MISSING); }
    }

    private validateMicroserviceAction(mockAction: IMockMicroServiceAction, validationErrors: string[], validationWarnings: string[] ) {


    }

    public get mock() {
        return this._mock;
    }
}