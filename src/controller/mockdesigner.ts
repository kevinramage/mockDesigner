import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import * as util from "util";
import * as winston from "winston";
import { IMock } from "../interface/mock";
import { Mock } from "../business/mock";
import { MockFactory } from "../factory/mockFactory";
import { ERRORS } from "../constantes";
import { IMockService } from "../interface/mockService";
import { IMockResponse } from "../interface/mockResponse";
import { IMockAction } from "../interface/mockAction";
import { IMockMessageAction } from "../interface/mockMessageAction";
import { IMockSaveAction } from "../interface/mockSaveAction";
import { IMockTrigger } from "../interface/mockTrigger";
import { IMockDataTriger } from "../interface/mockDataTrigger";

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
                const validationErrors = this.validate(this._mockInterface);
                if ( validationErrors.length > 0 ) {
                    throw new Error(validationErrors.join("\n"));
                }

                // Use the factory to build business object
                this._mock = MockFactory.build(this._mockInterface);
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


    private validate(mock: IMock) : string[] {
        winston.debug("MockDesigner.validate");
        var validationErrors : string[] = [];
        
        // Name
        if ( !mock.name ) { validationErrors.push(ERRORS.VALIDATION_MOCK_NAME); }
        else if ( typeof(mock.name) != "string") { 
            validationErrors.push(ERRORS.VALIDATION_MOCK_NAME); 
        }

        // Services
        if ( !mock.services ) { validationErrors.push(ERRORS.VALIDATION_MOCK_SERVICES); }
        else if ( !mock.services.length ) { 
            validationErrors.push(ERRORS.VALIDATION_MOCK_SERVICES); 
        }
        if ( mock.services ) {
            const instance = this;
            mock.services.forEach(service => {
                instance.validateService(service, validationErrors);
            });
        }

        return validationErrors;
    }

    private validateService(mockService: IMockService, validationErrors: string[]) {

        // Name
        if ( !mockService.name ) { validationErrors.push(ERRORS.VALIDATION_SERVICE_NAME); }
        else if ( typeof mockService.name != "string" ) { validationErrors.push(ERRORS.VALIDATION_SERVICE_NAME); }

        // Method (GET, POST, PUT, DELETE)
        if ( mockService.method ) {
            const method = mockService.method.toUpperCase();
            if ( method != "GET" && method != "POST" && method != "PUT" && method != "DELETE") {
                validationErrors.push(ERRORS.VALIDATION_SERVICE_METHOD);
            }
        }

        // Path
        if ( !mockService.path ) { validationErrors.push(ERRORS.VALIDATION_SERVICE_PATH); }
        else if ( typeof mockService.path != "string" ) { validationErrors.push(ERRORS.VALIDATION_SERVICE_PATH); }

        // Authentication

        // Data

        // Response
        if ( !mockService.response ) { validationErrors.push(ERRORS.VALIDATION_SERVICE_RESPONSE); }
        else if ( typeof mockService.response != "object" ) { validationErrors.push(ERRORS.VALIDATION_SERVICE_RESPONSE); }
        else { this.validateResponse(mockService.response, validationErrors); }
    }

    private validateResponse(mockResponse: IMockResponse, validationErrors: string[]) {

        // Triggers
        if ( mockResponse.triggers ) {
            const instance = this;
            mockResponse.triggers.forEach(trigger => {
                instance.validateTrigger(trigger, validationErrors);
            });
        }
    }

    private validateTrigger(mockTrigger: IMockTrigger, validationErrors: string[]) {

        // Type
        const triggerType = [ "data", "check", "random", "sequential", "none"];
        if ( !mockTrigger.type ) { validationErrors.push(ERRORS.VALIDATION_TRIGGER_TYPE); }
        else if ( !triggerType.includes(mockTrigger.type) ) { validationErrors.push(ERRORS.VALIDATION_TRIGGER_TYPE); }
        else if ( mockTrigger.type == "data" ) {
            this.validationDataTrigger(mockTrigger as IMockDataTriger, validationErrors);
        }
    }

    private validationDataTrigger(mockDataTrigger: IMockDataTriger, validationErrors: string[]) {

        // Conditions
        
        // Actions
        if ( !mockDataTrigger.actions ) { validationErrors.push(ERRORS.VALIDATION_TRIGGERDATA_ACTIONS); }
        else if ( !mockDataTrigger.actions.length ) { validationErrors.push(ERRORS.VALIDATION_TRIGGERDATA_ACTIONS); }
        if ( mockDataTrigger.actions ) {
            const instance = this;
            mockDataTrigger.actions.forEach(action => {
                instance.validateAction(action, validationErrors);
            });
        }
    }

    private validateAction(mockAction: IMockAction, validationErrors: string[]) {

        // Type
        if ( !mockAction.type ) { validationErrors.push(ERRORS.VALIDATION_ACTION_TYPE); }
        else if ( typeof mockAction.type != "string" ) { validationErrors.push(ERRORS.VALIDATION_ACTION_TYPE); }
        else {
            switch ( mockAction.type ) {
                case "message":
                    this.validateMessageAction(mockAction as IMockMessageAction, validationErrors);
                break;
                case "save":
                    this.validateSaveAction(mockAction as IMockSaveAction, validationErrors);
                break;
                case "wait":
                    break;
                default:
                    validationErrors.push(ERRORS.VALIDATION_ACTION_TYPE);
            }
        }
    }

    private validateMessageAction(mockAction: IMockMessageAction, validationErrors: string[]) {

        // Status
        if ( !mockAction.status ) { validationErrors.push(ERRORS.VALIDATION_ACTIONMSG_STATUS); }
        else if ( typeof mockAction.status != "number" ) { validationErrors.push(ERRORS.VALIDATION_ACTIONMSG_STATUS); }

        // Headers

        // Body
        if ( !mockAction.body && !mockAction.bodyFile ) { validationErrors.push(ERRORS.VALIDATION_ACTIONMSG_BODY); }
        else if ( mockAction.body && typeof mockAction.body != "string" ) {
            validationErrors.push(ERRORS.VALIDATION_ACTIONMSG_BODY);
        } else if ( mockAction.bodyFile && typeof mockAction.bodyFile != "string" ) {
            validationErrors.push(ERRORS.VALIDATION_ACTIONMSG_BODY);
        }
    }

    private validateSaveAction(mockAction: IMockSaveAction, validationErrors: string[]) {

        // Expressions
        if ( !mockAction.expressions ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_EXPRESSIONS); }
        else if ( typeof mockAction.expressions != "object" || !mockAction.expressions.length ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_EXPRESSIONS); }

        // Storage
        if ( !mockAction.storage ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_STORAGE); }
        else if ( typeof mockAction.storage != "string" ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_STORAGE); } 

        // Keys
        if ( !mockAction.keys ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_KEYS); }
        else if ( typeof mockAction.keys != "object" || !mockAction.expressions.length ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_KEYS); }

    }

    public get mock() {
        return this._mock;
    }
}