export module METHODS {
    export const GET = "GET";
    export const POST = "POST";
    export const PUT = "PUT";
    export const DELETE = "DELETE";
}

export module TRIGGERS {
    export const NONE = "NONE";
    export const DATA = "DATA";
    export const SEQUENTIAL = "SEQUENTIAL";
    export const RANDOM = "RANDOM";
}

export module ACTIONS {
    export const MESSAGE = "MESSAGE";
    export const WAIT = "WAIT";
    export const SAVE = "SAVE";
}

export module AUTHENTICATIONS {
    export const BASIC = "BASIC";
    export const APIKEY = "APIKEY";
    export const TOKEN = "TOKEN";
}

export module APIKEY_SOURCES {
    export const HEADER = "HEADER";
    export const QUERY = "QUERY";
}

export module OPERATION {
    export const EQUALS = "EQUALS";
    export const NOT_EQUALS = "NOT_EQUALS";
    export const MATCHES = "MATCHES";
    export const NOT_MATCHES = "NOT_MATCHES";
    export const IN = "IN";
    export const NOT_IN = "NOT_IN";
    export const RANGE = "RANGE";
}

export module OPTIONS {
    export const DEBUG = "system.debug";
    export const VERSION = "system.version";
    export const MOCK_WORKDIR = "system.workingDirectory";
    export const DISPLAY_CTXMEMORY = "system.displayContextMemory";
    export const AUTHORIZED_METHODS = "app.authorizedMethods";
    export const CONTENTTYPE_DETECTION_ENABLED = "app.contentTypeDetection.enabled";
    export const DISPLAY_LISTENERS = "app.displayListeners";
    export const DISPLAY_DATASOURCES = "app.displayDataSources";
    export const DISPLAY_FUNCTIONS = "app.displayFunctions";
    export const MONITORING_MAXREQUESTS = "app.monitoring.maxrequests";
    export const MONITORING_MAXRESPONSES = "app.monitoring.maxresponses";
    export const PORT = "system.port";
}