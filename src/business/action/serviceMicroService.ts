import * as winston from "winston";
import * as util from "util";
import { IServiceAction } from "./serviceAction";
import { IStorage, IStorageParent } from "../../templates/manager/microServiceManager";

export class ServiceMicroService implements IServiceAction {

    private _action : string;
    private _storage : IStorage | undefined;
    private _data : string;
    private _expiration : number;

    constructor() {
        this._action = "";
        this._data = "{{.request.body}}";
        this._expiration = 3600;
    }

    generate(tab: string): string {
        winston.debug("ServiceMicroService.generate");
        var code = "";
        code += this.generateStorage(tab);

        switch (this._action ) {
            case "getall":
                code += this.generateGetAll(tab);
            break;

            case "get":
                code += this.generateGet(tab);
            break;

            case "create":
                code += this.generateCreate(tab);
            break;

            case "update":
                code += this.generateUpdate(tab);
            break;

            case "updatedelta":
                code += this.generateUpdateDelta(tab);
            break;

            case "delete":
                code += this.generateDelete(tab);
            break;

            case "deleteall":
                code += this.generateDeleteAll(tab);
            break;

            case "search":
                code += this.generateSearch(tab);
            break;

            case "enable":
                code += this.generateEnable(tab);
            break;

            case "disable":
                code += this.generateDisable(tab);
            break;

            case "disableall":
                code += this.generateDisableAll(tab);
            break;
        }

        return code;
    }

    private generateStorage(tab: string) {
        var code = "";

        code += tab + util.format("const storage : IStorage = {};\n");
        code += tab + util.format("storage.businessObject = \"%s\";\n", this.storage?.businessObject);
        if ( this.storage?.propertyName ) {
            code += tab + util.format("storage.propertyName = \"%s\";\n", this.storage?.propertyName);
        }
        if ( this.storage?.propertyValue ) {
            code += tab + util.format("storage.propertyValue = \"%s\";\n", this.storage?.propertyValue);
        }
        if ( this.storage?.parent ) {
            code += this.generateStorageParent(tab, this.storage.parent, "storage", 1);
        }

        return code;
    }

    private generateStorageParent(tab: string, storageParent: IStorageParent, storageName: string, storageCounter: number) {
        var code = "";

        code += tab + util.format("const storage%d : IStorage = {};\n", storageCounter);
        if ( storageParent.businessObject ) {
            code += tab + util.format("storage%d.businessObject = \"%s\";\n", storageCounter, storageParent.businessObject);
        }
        if ( storageParent.propertyValue ) {
            code += tab + util.format("storage%d.propertyValue = \"%s\";\n", storageCounter, storageParent.propertyValue);
        }
        code += tab + util.format("%s.parent = storage%d;\n", storageName, storageCounter);

        if ( storageParent.parent ) {
            code += this.generateStorageParent(tab, storageParent.parent, "storage" + storageCounter, storageCounter + 1 );
        }

        return code;
    }

    private generateGetAll(tab : string) {
        return tab + "MicroServiceManager.getAllObjects(context, res, storage);\n";
    }

    private generateGet(tab: string) {
        return tab + "MicroServiceManager.getObjectById(context, res, storage);\n";
    }

    private generateCreate(tab: string) {
        return tab + util.format("MicroServiceManager.createObject(context, res, storage, \"%s\", %d);\n", this.data, this.expiration);
    }

    private generateUpdate(tab: string) {
        return tab + util.format("MicroServiceManager.updateObject(context, res, storage, \"%s\", %d);\n", this.data, this.expiration);
    }

    private generateUpdateDelta(tab: string) {
        return tab + util.format("MicroServiceManager.updateDeltaObject(context, res, storage, \"%s\", %d);\n", this.data, this.expiration);
    }

    private generateDelete(tab: string) {
        return tab + "MicroServiceManager.deleteObject(context, res, storage);\n";
    }

    private generateDeleteAll(tab: string) {
        return tab + "MicroServiceManager.deleteAllObjects(context, res, storage);\n";
    }

    private generateSearch(tab: string) {
        return tab + "MicroServiceManager.searchObjects(context, res, storage);\n";
    }

    private generateEnable(tab: string) {
        return tab + util.format("MicroServiceManager.enableObject(context, res, storage, %d);\n", this.expiration);
    }

    private generateDisable(tab: string) {
        return tab + util.format("MicroServiceManager.disableObject(context, res, storage, %d);\n", this.expiration);
    }

    private generateDisableAll(tab: string) {
        return tab + util.format("MicroServiceManager.disableObjects(context, res, storage, %d);\n", this.expiration);
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

    public get data() {
        return this._data;
    }

    public set data(value) {
        this._data = value;
    }

    public get expiration() {
        return this._expiration;
    }

    public set expiration(value) {
        this._expiration = value;
    }
}