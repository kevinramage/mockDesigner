import { readFileSync, writeFileSync } from "fs";
import { OPTIONS } from "../utils/enum";
import * as winston from "winston";

export class OptionsManager {
    private static _instance : OptionsManager;
    private _options : {[key:string] : any};

    constructor() {
        this._options = {};
    }

    public getString(key: string) {
        return this._options[key] as string || "";
    }

    public getBoolean(key: string) {
        const option = this._options[key] as boolean | undefined;
        return option;
    }

    public getStringArray(key: string) {
        const option = this._options[key] as string[] | undefined;
        return option;
    }

    public getNumber(key: string) {
        const option = this._options[key] as number | undefined;
        return option;
    }

    public get debug() {
        const option = this.getBoolean(OPTIONS.DEBUG);
        return (option != undefined) ? option : true;
    }

    public get version() {
        return this.getString(OPTIONS.VERSION) || "1.0.0";
    }

    public get mockWorkingDirectory() {
        return this.getString(OPTIONS.MOCK_WORKDIR) || "mock";
    }

    public get authorizedMethods() {
        return this.getStringArray(OPTIONS.AUTHORIZED_METHODS) || ["GET", "POST", "PUT", "DELETE"]
    }

    public get port() {
        return this.getNumber(OPTIONS.PORT) || 7001;
    }

    public get isContentTypeDetectionEnabled() {
        const option = this.getBoolean(OPTIONS.CONTENTTYPE_DETECTION_ENABLED);
        return (option != undefined) ? option : true;
    }

    public get isDisplayContextMemory() {
        const option = this.getBoolean(OPTIONS.DISPLAY_CTXMEMORY);
        return (option != undefined) ? option : false;
    }

    public get isDisplayListeners() {
        const option = this.getBoolean(OPTIONS.DISPLAY_LISTENERS);
        return (option != undefined) ? option : false;
    }

    public get isDisplayFunctions() {
        const option = this.getBoolean(OPTIONS.DISPLAY_FUNCTIONS);
        return (option != undefined) ? option : false;
    }

    public get isDisplayDataSources() {
        const option = this.getBoolean(OPTIONS.DISPLAY_DATASOURCES);
        return (option != undefined) ? option : false;
    }

    public get options() {
        return this._options;
    }

    public loadOptions() {
        try {
            const buffer = readFileSync("options.json");
            const data = JSON.parse(buffer.toString());
            const keys = Object.keys(data);
            for (var index in keys) {
                const key = keys[index];
                this._options[key] = data[key];
            }
        } catch (err) {
            winston.error("OptionsManager.loadOptions - Impossible to load options: ", err);
        }
    }

    public saveOptions() {
        try {
            const content = JSON.stringify(this._options);
            writeFileSync("options.json", content);
            return true;

        } catch (err) {
            winston.error("OptionsManager.saveOptions - Impossible to save options: ", err);
            return false;
        }
    }

    public reset() {
        this._options = {};
        this._options[OPTIONS.DEBUG] = this.debug;
        this._options[OPTIONS.VERSION] = this.version;
        this._options[OPTIONS.MOCK_WORKDIR] = this.mockWorkingDirectory;
        this._options[OPTIONS.AUTHORIZED_METHODS] = this.authorizedMethods;
        this._options[OPTIONS.CONTENTTYPE_DETECTION_ENABLED] = this.isContentTypeDetectionEnabled;
        this._options[OPTIONS.PORT] = this.port;
        this._options[OPTIONS.DISPLAY_CTXMEMORY] = this.isDisplayContextMemory;
    }

    public static get instance() {
        if (!OptionsManager._instance) {
            OptionsManager._instance = new OptionsManager();
        }
        return OptionsManager._instance;
    }
}