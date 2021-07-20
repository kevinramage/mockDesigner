export class OptionsManager {

    public getString(key: string) : string;
    public getBoolean(key: string) : boolean | undefined;
    public getStringArray(key: string) : string | undefined;
    public getNumber(key: string) : number | undefined;
    public get debug() : boolean;
    public get version() : string;
    public get mockWorkingDirectory(): string;
    public get authorizedMethods(): string[];
    public get port() : number;
    public get isContentTypeDetectionEnabled() : boolean;
    public get options() : {[key: string] : string};
    public get isDisplayContextMemory() : boolean;
    public get isDisplayListeners() : boolean;
    public get isDisplayFunctions() : boolean;
    public get isDisplayDataSources() : boolean;
    public get monitoringMaxRequests() : number;
    public get monitoringMaxResponses() : number;

    public static instance : OptionsManager;
}