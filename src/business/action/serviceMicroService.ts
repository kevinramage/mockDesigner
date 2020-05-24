import * as winston from "winston";
import * as util from "util";
import { IServiceAction } from "./serviceAction";

export class ServiceMicroService implements IServiceAction {

    private _action : string;
    private _storage : string;
    private _keys: string[];
    private _identifierName : string | undefined;
    private _identifierValue : string | undefined;

    constructor() {
        this._action = "";
        this._storage = "";
        this._keys = [];
    }

    generate(tab: string): string {
        winston.debug("ServiceMicroService.generate");
        switch (this._action ) {
            case "getall":
                return this.generateGetAll(tab);
            case "get":
                return this.generateGet(tab);
            case "search":
                return this.generateSearch(tab);
            case "create":
                return this.generateCreate(tab);
            case "update":
                return this.generateUpdate(tab);
            case "delete":
                return this.generateDelete(tab);
            default:
                return "";
        }
    }

    generateGetAll(tab: string) : string {
        winston.debug("ServiceMicroService.generateGetAll");
        var code = "";

        // Check the presence of parent object
        if ( this.keys.length > 0 ) {
            //code += this.generateCheckCode(tab, this.keys);
        }

        // Generate key code
        code += this.generateKeyListCode(tab, this.keys);

        // Generate code to get all objects
        code += tab + util.format("// Get all object\n");
        code += tab + util.format("const objects = await RedisManager.instance.getAllObject(keyList);\n");
        code += tab + util.format("var data = JSON.stringify(objects);\n\n");
        
        // Generate code to send response
        code += this.generateCodeToSendResponse(tab);

        return code;
    }

    generateGet(tab: string): string {
        winston.debug("ServiceMicroService.generateGet");
        var code = "";

        // Check the presence of parent object
        if ( this.keys.length > 1 ) {
            //code += this.generateCheckCode(tab, this.keys.slice(0, this.keys.length - 1));
        }

        // Generate key code
        code += this.generateKeyCode(tab);

        // Generate code to get data
        code += tab + util.format("// Get data\n");
        code += tab + util.format("var data = await RedisManager.instance.getValue(key);\n\n"); 

        // Generate code to send response
        code += this.generateCodeToSendResponse(tab);

        return code;
    }

    generateSearch(tab: string): string {
        winston.debug("ServiceMicroService.generateSearch");
        var code = "";
        return code;
    }

    generateCreate(tab: string): string {
        winston.debug("ServiceMicroService.generateCreate");
        var code = "";

        // Check the presence of parent object
        if ( this.keys.length > 0 ) {
            //code += this.generateCheckCode(tab, this.keys);
        }

        // Generate code to build object
        code += this.generateBuildObjectCode(tab);

        // Generate key code
        code += this.generateKeyCodeWithNewIdentifier(tab);

        // Generate code to save object
        code += tab + util.format("// Save object\n");
        code += tab + util.format("const DEFAULT_EXPIRATION = 60 * 60 * 10;\n");
        code += tab + util.format("await RedisManager.instance.setExValue(key, DEFAULT_EXPIRATION, JSON.stringify(obj));\n\n");

        // Generate code to add index
        code += this.generateUpdateIndexCode(tab);

        // Generated code to send response
        code += this.generateCodeToSendObjectResponse(tab, 201);

        return code;
    }

    generateUpdate(tab: string): string {
        winston.debug("ServiceMicroService.generateUpdate");
        var code = "";

        // Check the presence of parent object
        if ( this.keys.length > 1 ) {
            //code += this.generateCheckCode(tab, this.keys.slice(0, this.keys.length - 1));
        }

        // Generate code to build object
        code += tab + util.format("// Build object\n");
        code += tab + util.format("const obj = context?.request?.body || {};\n\n");

        // Generate key code
        code += this.generateKeyCode(tab);

        // Generate code to save object
        code += tab + util.format("// Save object\n");
        code += tab + util.format("const DEFAULT_EXPIRATION = 60 * 60 * 10;\n");
        code += tab + util.format("await RedisManager.instance.setExValue(key, DEFAULT_EXPIRATION, JSON.stringify(obj));\n\n");

        // Generated code to send response
        code += this.generateCodeToSendObjectResponse(tab, 200);

        return code;
    }

    generateDelete(tab: string): string {
        winston.debug("ServiceMicroService.generateDelete");
        var code = "";

        // Check the presence of parent object
        if ( this.keys.length > 1 ) {
            //code += this.generateCheckCode(tab, this.keys.slice(0, this.keys.length - 1));
        }

        // Delete object
        code += this.generateKeyCode(tab);
        code += tab + util.format("// Delete object\n");
        code += tab + util.format("await RedisManager.instance.deleteValue(key);\n\n");

        // Update index
        code += this.generateKeyListCode(tab, this.keys.slice(0, this.keys.length - 1));
        code += tab + util.format("// Remove index\n");
        code += tab + util.format("await RedisManager.instance.removeIndex(keyList, key);\n\n");

        // Generate code to send reponse
        code += this.generateCodeToSendEmptyResponse(tab);

        return code;
    }

    private generateCheckCode(tab: string, keys: string[]) {
        var code = "";

        // Check the presence of parent object
        code += tab + util.format("// Check the presence of parent object\n");
        code += tab + util.format("const idList : string[] = [];\n");
        keys.forEach(key => {
            code += tab + util.format("idList.push(await TemplateManager.instance.evaluate(\"%s\", context));\n", key);
        });
        code += tab + util.format("const keysValid = await RedisManager.instance.checkValues(idList);\n");
        code += tab + util.format("if ( !keysValid ) {\n");
        code += tab + util.format("\tconst data = JSON.stringify({ \"code\": 404, \"message\": \"Resource not found\" });\n");
        code += tab + util.format("\tconst headers : {[key: string]: string} = {};\n");
        code += tab + util.format("\theaders[\"Content-Type\"] = \"application/json\";\n");
        code += tab + util.format("\tawait ResponseHandler.sendContent(context, res, 404, data, headers);\n");
        code += tab + util.format("\treturn;\n");
        code += tab + util.format("}\n\n");

        return code;
    }

    private generateKeyCode(tab: string) {
        var code = "";

        // Generate key code from keys properties
        code += tab + util.format("// Generate key\n");
        code += tab + util.format("key = \"%s$$\";\n", this.storage);
        for ( var i = 0; i < this.keys.length; i++) {
            code += tab + util.format("key += await TemplateManager.instance.evaluate(\"%s\", context);\n", this.keys[i]);
            if ( i < this.keys.length - 1) {
                code += tab + util.format("key += \"-\";\n");
            }
        }
        code += "\n";

        return code;
    }

    private generateKeyListCode(tab: string, keys: string[]) {
        var code = "";

        // Generate key code for a list
        code += tab + util.format("// Generate key code for a list\n");
        code += tab + util.format("var keyList = \"%s_list\";\n", this.storage);
        for ( var i = 0; i < keys.length; i++) {
            if ( i == 0) {
                code += tab + util.format("keyList += \"$$\";\n");
            }
            code += tab + util.format("keyList += await TemplateManager.instance.evaluate(\"%s\", context);\n", this.keys[i]);
            if ( i < keys.length - 1 ) {
                code += tab + util.format("keyList += \"-\";\n");
            }
        }

        code += "\n";

        return code;
    }

    private generateKeyCodeWithNewIdentifier(tab: string) {
        var code = "";

        // Generate key code with new identifier
        code += tab + util.format("// Generate key with new identifier\n");
        code += tab + util.format("key = \"%s$$\";\n", this.storage);
        for ( var i = 0; i < this.keys.length; i++) {
            code += tab + util.format("key += await TemplateManager.instance.evaluate(\"%s\", context);\n", this.keys[i]);
            code += tab + util.format("key += \"-\";\n");
        }
        code += tab + util.format("key += newId;\n\n");

        return code;
    }

    private generateCodeToSendResponse(tab: string) {
        var code = "";

        // Generate code to send response
        code += tab + util.format("// Send response\n");
        code += tab + util.format("if ( data != null ) {\n");
        code += tab + util.format("\tconst headers : {[key: string]: string} = {};\n");
        code += tab + util.format("\theaders[\"Content-Type\"] = \"application/json\";\n");
        code += tab + util.format("\tawait ResponseHandler.sendContent(context, res, 200, data, headers);\n");

        // Generate code for error response
        code += tab + util.format("} else {\n");
        code += tab + util.format("\tdata = JSON.stringify({ \"code\": 404, \"message\": \"Resource not found\" });\n");
        code += tab + util.format("\tconst headers : {[key: string]: string} = {};\n");
        code += tab + util.format("\theaders[\"Content-Type\"] = \"application/json\";\n");
        code += tab + util.format("\tawait ResponseHandler.sendContent(context, res, 404, data, headers);\n");
        code += tab + util.format("}\n\n");

        return code;
    }

    private generateCodeToSendObjectResponse(tab: string, status: number) {
        var code = "";

        // Generated code to send response
        code += tab + util.format("// Send reponse\n");
        code += tab + util.format("const headers : {[key: string]: string} = {};\n");
        code += tab + util.format("headers[\"Content-Type\"] = \"application/json\";\n");
        code += tab + util.format("await ResponseHandler.sendContent(context, res, %d, JSON.stringify(obj), headers);\n\n", status);

        return code;
    }

    private generateCodeToSendEmptyResponse(tab: string) {
        var code = "";

        // Generate code to delete index
        code += tab + util.format("// Send reponse\n");
        code += tab + util.format("const headers : {[key: string]: string} = {};\n");
        code += tab + util.format("await ResponseHandler.sendContent(context, res, 204, \"\", headers);\n\n");

        return code;
    }

    private generateBuildObjectCode(tab: string) {
        var code = "";

        // Generate code to build object
        code += tab + util.format("// Build object\n");
        code += tab + util.format("const obj = context?.request?.body || {};\n");
        code += tab + util.format("const newId = await TemplateManager.instance.evaluate(\"%s\", context);\n", this.identifierValue);
        code += tab + util.format("obj.%s = newId;\n\n", this.identifierName);

        return code;
    }

    private generateUpdateIndexCode(tab: string){
        var code = "";

        // Generate code to add index
        code += tab + util.format("// Add index\n");
        code += tab + util.format("var ids = \"%s_list\";\n", this.storage);
        for ( var i = 0; i < this.keys.length; i++) {
            if ( i == 0) {
                code += tab + util.format("ids += \"$$\";\n");
            }
            code += tab + util.format("ids += await TemplateManager.instance.evaluate(\"%s\", context);\n", this.keys[i]);
            if ( i < this.keys.length - 1 ) {
                code += tab + util.format("ids += \"-\";\n");
            }
        }
        code += tab + util.format("await RedisManager.instance.addIndex(ids, key);\n\n");

        return code;
    }

    public addKey(key: string) {
        this._keys.push(key);
    }

    public get action() {
        return this._action;
    }
    public set action(value) {
        this._action = value;
    }

    public get storage() {
        return this._storage;
    }
    public set storage(value) {
        this._storage = value;
    }

    public get identifierName(){
        return this._identifierName;
    }
    public set identifierName(value) {
        this._identifierName = value;
    }

    public get identifierValue() {
        return this._identifierValue;
    }
    public set identifierValue(value) {
        this._identifierValue = value;
    }

    public get keys() {
        return this._keys;
    }
}