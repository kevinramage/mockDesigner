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

        // Generate code to add index
        code += tab + util.format("// Get all object\n");
        code += tab + util.format("const data = await RedisManager.instance.getAllObject(\"%s\");\n\n",this.storage);
        
        // Generate code to send response
        code += tab + util.format("const headers : {[key: string]: string} = {};\n");
        code += tab + util.format("headers[\"Content-Type\"] = \"application/json\";\n");
        code += tab + util.format("await ResponseHandler.sendContent(context, res, 200, JSON.stringify(data), headers);\n");

        return code;
    }

    generateGet(tab: string): string {
        winston.debug("ServiceMicroService.generateGet");
        var code = "";

        // Generate code to get data
        code += tab + util.format("// Get data & send response\n");
        code += tab + util.format("var id;\n");
        code += tab + util.format("key = \"%s\";\n", this.storage);
        this.keys.forEach(key => {
            code += tab + util.format("id = await TemplateManager.instance.evaluate(\"%s\", context);\n", key);
            code += tab + util.format("key += \"$$\" + id;\n");
        });   
        code += tab + util.format("var data = await RedisManager.instance.getValue(key);\n"); 

        // Generate code to send response
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
        code += tab + util.format("}\n");

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

        // Generate code to build object
        code += tab + util.format("// Build object\n");
        code += tab + util.format("const obj = context?.request?.body || {};\n");
        code += tab + util.format("const newId = await TemplateManager.instance.evaluate(\"%s\", context);\n", this.identifierValue);
        code += tab + util.format("obj.%s = newId;\n\n", this.identifierName);

        // Generate code to save object
        code += tab + util.format("// Save object\n");
        code += tab + util.format("var id;\n");
        code += tab + util.format("key = \"%s\";\n", this.storage);
        this.keys.forEach(key => {
            code += tab + util.format("id = await TemplateManager.instance.evaluate(\"%s\", context);\n", key);
            code += tab + util.format("key += \"$$\" + id;\n");
        });   
        code += tab + util.format("key += \"$$\" + newId;\n"); 
        code += tab + util.format("const DEFAULT_EXPIRATION = 60 * 60 * 10;\n");
        code += tab + util.format("await RedisManager.instance.setExValue(key, DEFAULT_EXPIRATION, JSON.stringify(obj));\n\n");

        // Generate code to add index
        code += tab + util.format("// Add index\n");
        code += tab + util.format("await RedisManager.instance.addIndex(\"%s_list\", newId);\n\n",this.storage);

        // Generated code to send response
        code += tab + util.format("// Send reponse\n");
        code += tab + util.format("const headers : {[key: string]: string} = {};\n");
        code += tab + util.format("headers[\"Content-Type\"] = \"application/json\";\n");
        code += tab + util.format("await ResponseHandler.sendContent(context, res, 201, JSON.stringify(obj), headers);\n\n");

        return code;
    }

    generateUpdate(tab: string): string {
        winston.debug("ServiceMicroService.generateUpdate");
        var code = "";

        // Generate code to build object
        code += tab + util.format("// Build object\n");
        code += tab + util.format("const obj = context?.request?.body || {};\n");

        // Generate code to save object
        code += tab + util.format("// Save object\n");
        code += tab + util.format("var id;\n");
        code += tab + util.format("key = \"%s\";\n", this.storage);
        this.keys.forEach(key => {
            code += tab + util.format("id = await TemplateManager.instance.evaluate(\"%s\", context);\n", key);
            code += tab + util.format("key += \"$$\" + id;\n");
        });
        code += tab + util.format("const DEFAULT_EXPIRATION = 60 * 60 * 10;\n");
        code += tab + util.format("await RedisManager.instance.setExValue(key, DEFAULT_EXPIRATION, JSON.stringify(obj));\n\n");

        // Generated code to send response
        code += tab + util.format("// Send reponse\n");
        code += tab + util.format("const headers : {[key: string]: string} = {};\n");
        code += tab + util.format("headers[\"Content-Type\"] = \"application/json\";\n");
        code += tab + util.format("await ResponseHandler.sendContent(context, res, 200, JSON.stringify(obj), headers);\n\n");

        return code;
    }

    generateDelete(tab: string): string {
        winston.debug("ServiceMicroService.generateDelete");
        var code = "";

        // Generate code to delete data
        code += tab + util.format("// Delete data\n");
        code += tab + util.format("var id;\n");
        code += tab + util.format("key = \"%s\";\n", this.storage);
        this.keys.forEach(key => {
            code += tab + util.format("id = await TemplateManager.instance.evaluate(\"%s\", context);\n", key);
            code += tab + util.format("key += \"$$\" + id;\n");
        });
        code += tab + util.format("await RedisManager.instance.deleteValue(key);\n");
        code += tab + util.format("await RedisManager.instance.removeIndex(\"%s_list\", id);\n\n",this.storage);

        // Generate code to delete index
        code += tab + util.format("// Send reponse\n");
        code += tab + util.format("const headers : {[key: string]: string} = {};\n");
        code += tab + util.format("await ResponseHandler.sendContent(context, res, 204, \"\", headers);\n\n");

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