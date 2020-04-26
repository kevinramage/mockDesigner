import * as fs from "fs";
import * as yaml from "yaml";
import * as util from "util";
import * as winston from "winston";
import { IMock } from "../interface/mock";
import { Mock } from "../business/mock";
import { MockFactory } from "../factory/mockFactory";
import { ERRORS } from "../constantes";
import { IMockService } from "interface/mockService";
import { IMockResponse } from "interface/mockResponse";
import { IMockAction } from "interface/mockAction";
import { IMockMessageAction } from "interface/mockMessageAction";

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
                const body = buffer.toString();
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

        // Trigger

        // Actions
        if ( !mockResponse.actions ) { validationErrors.push(ERRORS.VALIDATION_RESPONSE_ACTIONS); }
        else if ( !mockResponse.actions.length ) { validationErrors.push(ERRORS.VALIDATION_RESPONSE_ACTIONS); }
        if ( mockResponse.actions ) {
            const instance = this;
            mockResponse.actions.forEach(action => {
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

    public get mock() {
        return this._mock;
    }
}