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
    export const DEBUG = "DEBUG";
    export const VERSION = "VERSION";
    export const MOCK_WORKDIR = "MOCK_WORKDIR";
}