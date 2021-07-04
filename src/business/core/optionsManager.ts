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
        return this._options[key] && (this._options[key].toLowerCase() == "true" || this._options[key]== "1");
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