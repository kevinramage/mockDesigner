export module KEYS {
    export const APPNAME = "{{.name}}";
    export const APPPORT = "{{.port}}";
    export const IMPORTS = "// {{.imports}}";
    export const ROUTES = "// {{.routes}}";
    export const REGISTER = "// {{.register}}";
}

export module ERRORS {
    export const MOCK_READING = "An error occured during the mock reading";
    export const FILE_UPDATE = "An error occured during the file update";
    export const INVALID_PROJECTNAME = "Invalid project name, there are some invalid character in project name provided";
    export const INVALID_PORT = "Invalid port number, the port must be a positive integer";
    export const INVALID_INPUTDIR = "Invalid input directory, the input directory not exits";
    export const INVALID_INPUTDIREXPRESSION = "Invalid input directory, the expression is not valid";
    export const INVALID_INPUTDIR_FILENOTEXISTS = "Invalid input, the file mentionned not exists";
    export const INVALID_INPUTDIR_ISDIRECTORY = "Invalid input, the file mentionned is a directory";
    export const INVALID_INPUTDIR_NOFILES = "Invalid input, no files to proceed";

    export const FAIL_READDIR = "An error occured during the directory reading";
    export const FAIL_READFILE = "An error occured during the file reading";

    export const VALIDATION_MOCK_NAME = "The mock must have a name string attribute";
    export const VALIDATION_MOCK_SERVICES = "The mock must have a services array attribute";
    export const VALIDATION_SERVICE_NAME = "The mock service must have a name string attribute";
    export const VALIDATION_SERVICE_METHOD = "The mock service method must match with one of the following value: GET, POST, PUT, DELETE";
    export const VALIDATION_SERVICE_PATH = "The mock service must have a path string attribute";
    export const VALIDATION_SERVICE_RESPONSE = "The mock service must have a response attribute";
    export const VALIDATION_ACTION_TYPE = "The mock action must have a type string attribute";
    export const VALIDATION_ACTIONMSG_STATUS = "The mock message action must have a status number attribute";
    export const VALIDATION_ACTIONMSG_BODY = "The mock message action must have a body or bodyFile string attribute";
    export const VALIDATION_ACTIONSAVE_KEY = "The mock save action must have a key string attribute";
    export const VALIDATION_ACTIONSAVE_SOURCE = "The mock save action must have a source object defined";
    export const VALIDATION_ACTIONSAVE_SOURCE_TYPE = "The mock save action must have a source type attribute";
    export const VALIDATION_ACTIONSAVE_SOURCE_FIELDNAME = "The mock save action must have a source field name attribute";
    export const VALIDATION_TRIGGER_TYPE = "The mock trigger must have a type string attribute";
    export const VALIDATION_TRIGGERDATA_EXPRESSION = "The mock trigger must have an expression string attribute";
    export const VALIDATION_TRIGGERDATA_ACTIONS = "The mock trigger must have an actions attribute";
}

export module HTTP_METHODS {
    export const GET = "GET";
    export const POST = "POST";
    export const PUT = "PUT";
    export const DELETE = "DELETE";
}

export module AUTHENTICATION_TYPE {
    export const BASIC_AUTHENTICATION = "BASIC";
    export const APIKEY_AUTHENTICATION = "APIKEY";
}

export module IDGENERATION_TYPE {
    export const NEWINTEGERID = "NewIntegerId";
    export const NEWUUID = "NewUUID";
}