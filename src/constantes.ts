export module KEYS {
    export const APPNAME = "{{.name}}";
    export const APPPORT = "{{.port}}";
    export const IMPORTS = "// {{.imports}}";
    export const ROUTES = "// {{.routes}}";
}

export module ERRORS {
    export const MOCK_READING = "An error occured during the mock reading";
    export const FILE_UPDATE = "An error occured during the file update";
}
export module AUTHENTICATION_TYPE {
    export const BASIC_AUTHENTICATION = "BASIC";
    export const APIKEY_AUTHENTICATION = "APIKEY";
}