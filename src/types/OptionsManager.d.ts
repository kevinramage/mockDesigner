export class OptionsManager {

    public getString(key: string) : string;
    public getBoolean(key: string) : boolean;
    public get debug() : boolean;
    public get version() : string;
    public get options() : {[key: string] : string};

    public static instance : OptionsManager;
}