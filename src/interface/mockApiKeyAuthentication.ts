import { IMockAuthentication } from "./mockAuthentication";

export interface IMockApiKeyAuthentication extends IMockAuthentication {
    type: "APIKEY",
    source: "HEADER" | "QUERY",
    keyName: string,
    keyValue: string
}