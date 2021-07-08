export class OptionsManager {

    public getString(key: string) : string;
    public getBoolean(key: string) : boolean | undefined;
    public getStringArray(key: string) : string | undefined;
    public get debug() : boolean;
    public get version() : string;
    public get mockWorkingDirectory(): string;
    public get authorizedMethods(): string[];
    public get port() : number;
    public get isContentTypeDetectionEnabled() : boolean;
    public get options() : {[key: string] : string};

    public static instance : OptionsManager;
}