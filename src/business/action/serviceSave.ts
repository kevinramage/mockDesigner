import * as util from "util";
import { IServiceAction } from "./serviceAction";
import { ServiceSaveSource } from "./serviceSaveSource";
import { IDGENERATION_TYPE } from "../../constantes";

export class ServiceSave implements IServiceAction {

    private _key : string | undefined;
    private _source : ServiceSaveSource; 

    constructor() {
        this._source = new ServiceSaveSource();
    }

    generate(tab: string): string {
        var code = "";
        if ( this.source.type == IDGENERATION_TYPE.NEWINTEGERID ) {
            code += tab + "context.newIntegerId = await TemplateManager.uniqueId();\n";
            code += tab + util.format("await RedisManager.instance.saveObject(\"%s\", \"%s\", context.newIntegerId + \"\", context?.request?.body);\n", this.key, this.source.fieldName)
        } else if ( this.source.type == IDGENERATION_TYPE.NEWUUID ) {
            code += tab + "context.newUUID = await TemplateManager.uuid();\n";
            code += tab + util.format("await RedisManager.instance.saveObject(\"%s\", \"%s\", context.newUUID, context?.request?.body);\n", this.key, this.source.fieldName)
        }
        return code;
    }
    
    public get key() {
        return this._key;
    }
    public set key(value) {
        this._key = value;
    }
    public get source() {
        return this._source;
    }
    public set source(value) {
        this._source = value;
    }
}