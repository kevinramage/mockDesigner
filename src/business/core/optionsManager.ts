import { OPTIONS } from "../utils/enum";

export class OptionsManager {
    private static _instance : OptionsManager;
    private _options : {[key:string] : string};

    constructor() {
        this._options = {};
    }

    public getString(key: string) {
        return this._options[key];
    }

    public getBoolean(key: string) {
        const option = this._options[key];
        return option ? option.toLowerCase() == "true" || option == "1" : undefined;
    }

    public getStringArray(key: string) {
        const option = this._options[key];
        return option ? option.split(",") : undefined;
    }

    public getNumber(key: string) {
        const option = this._options[key];
        const number = option ? Number.parseInt(option) : undefined;
        return number ? (!isNaN(number) ? number : undefined) : undefined;
    }

    public get debug() {
        return this.getBoolean(OPTIONS.DEBUG) || true;
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
        return  this.getBoolean(OPTIONS.CONTENTTYPE_DETECTION_ENABLED) || true;
    }

    public get options() {
        return this._options;
    }

    public static get instance() {
        if (!OptionsManager._instance) {
            OptionsManager._instance = new OptionsManager();
        }
        return OptionsManager._instance;
    }
}