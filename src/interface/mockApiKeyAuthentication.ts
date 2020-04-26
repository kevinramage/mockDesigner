export interface IMockApiKeyAuthentication {
    type: "APIKEY",
    source: "HEADER" | "QUERY",
    keyName: string,
    keyValue: string
}