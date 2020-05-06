import * as util from "util";
import { IServiceAction } from "./serviceAction";

export class ServiceSave implements IServiceAction {

    private _expressions : {[key: string]: string};
    private _storage : string | undefined;
    private _keys : string[];

    constructor() {
        this._expressions = {};
        this._keys = [];
    }

    generate(tab: string): string {
        var code = "";
        
        // Compute object to store
        code += tab + "// Save object to redis\n";
        code += tab + "const obj = {\n";
        Object.keys(this.expressions).forEach(key => {
            code += tab + "\t" + util.format("\"%s\": await TemplateManager.instance.evaluate(\"%s\", context),\n", key, this.expressions[key]);
        });
        code = code.substring(0, code.length - 2);
        code += "\n";
        code += tab + "};\n";
        code += "\n";

        // Compute storage key
        code += tab + util.format("var key = \"%s$$\";\n", this.storage);
        this.keys.forEach(k => {
            code += tab + util.format("key += await TemplateManager.instance.evaluate(\"%s\", context) + \"$$\";\n", k);
        });
        code += tab + "key = key.substring(0, key.length - 2);\n";
        code += "\n";

        // Add code to save the object in redis
        code += tab + "RedisManager.instance.setValue(key, JSON.stringify(obj));\n";
        code += "\n";

        return code;
    }

    public addExpression(key: string, value: string) {
        this._expressions[key] = value;
    }

    public addKey(key: string) {
        this._keys.push(key);
    }
    
    public get expressions() {
        return this._expressions;
    }

    public get storage() {
        return this._storage;
    }
    public set storage(value) {
        this._storage = value;
    }

    public get keys() {
        return this._keys;
    }
}