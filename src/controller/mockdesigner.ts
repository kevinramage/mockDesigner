import * as fs from "fs";
import * as yaml from "yaml";
import * as util from "util";
import * as winston from "winston";
import { IMock } from "../interface/mock";
import { Mock } from "../business/mock";
import { MockFactory } from "../factory/mockFactory";
import { ERRORS, IDGENERATION_TYPE } from "../constantes";
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
        if ( !mockTrigger.type ) { validationErrors.push(ERRORS.VALIDATION_TRIGGER_TYPE); }
        else if ( mockTrigger.type != "data" && mockTrigger.type != "check" && mockTrigger.type != "none") { validationErrors.push(ERRORS.VALIDATION_TRIGGER_TYPE); }
        else if ( mockTrigger.type == "data" ) {
            this.validationDataTrigger(mockTrigger as IMockDataTriger, validationErrors);
        }
    }

    private validationDataTrigger(mockDataTrigger: IMockDataTriger, validationErrors: string[]) {

        // Expression
        if ( !mockDataTrigger.expression) { validationErrors.push(ERRORS.VALIDATION_TRIGGERDATA_EXPRESSION); }
        else if ( typeof mockDataTrigger.expression != "string" ) { validationErrors.push(ERRORS.VALIDATION_TRIGGERDATA_EXPRESSION); }

        // Actions
        else if ( !mockDataTrigger.actions ) { validationErrors.push(ERRORS.VALIDATION_TRIGGERDATA_ACTIONS); }
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

        // Key mandatory (string)
        if ( !mockAction.key ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_KEY); }
        else if ( typeof mockAction.key != "string" ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_KEY); } 

        // Source mandatory (object)
        if ( !mockAction.source ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_SOURCE); }
        else if ( typeof mockAction.source != "object") { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_SOURCE); }

        // Source type mandatory (string equals to NEWID)
        else if ( !mockAction.source.type ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_SOURCE_TYPE); }
        else if ( typeof mockAction.source.type != "string" ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_SOURCE_TYPE); }
        else if ( mockAction.source.type != IDGENERATION_TYPE.NEWINTEGERID && mockAction.source.type != IDGENERATION_TYPE.NEWUUID ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_SOURCE_TYPE); }

        // Source field name mandatory (string)
        else if ( !mockAction.source.fieldName ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_SOURCE_FIELDNAME); }
        else if ( typeof mockAction.source.fieldName != "string" ) { validationErrors.push(ERRORS.VALIDATION_ACTIONSAVE_SOURCE_FIELDNAME); }
    }

    public get mock() {
        return this._mock;
    }
}