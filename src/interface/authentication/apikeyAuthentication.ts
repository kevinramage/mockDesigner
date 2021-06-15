export interface IApiKeyAuthentication {
    type: "APIKEY" | "apikey";
    source: "HEADER" | "header" | "QUERY" | "query";
    key: string;
    value: string;
}