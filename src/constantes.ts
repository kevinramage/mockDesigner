export module KEYS {
    export const APPNAME = "{{.name}}";
    export const APPPORT = "{{.port}}";
    export const IMPORTS = "// {{.imports}}";
    export const ROUTES = "// {{.routes}}";
    export const REGISTER = "// {{.register}}";
    export const DOCKERPORT = "##PORTS";
    export const DOCU = "##DOCU";
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

    export const MOCKNAME_MISSING = "You must define a mock name. The name property must be not empty";
    export const MOCKSERVICES_MISSING = "You must define a mock services. The services property must be not empty";
    export const MOCKSERVICES_ATLEASTONE = "You must define at least one service";
    export const SERVICENAME_MISSING = "You must define a service name. The service name property must be not empty";
    export const SERVICENAME_ALREADYEXISTS = "You already define a service name with the value '%s'. The service name property must be unique";
    export const SERVICEMETHOD_INVALID = "The service method must match with one of the following values: GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH";
    export const AUTHENTICATIONTYPE_MISSING = "You must define a authentication type. The authentication type property must be not empty";
    export const AUTHENTICATIONTYPE_INVALID = "The service authentication must match with one of the following values: BASIC, APIKEY";
    export const SERVICERESPONSE_MISSING = "You must define a service response. The service response property must be not empty";
    export const RESPONSETRIGGERS_MISSING = "You must define a response triggers. The response triggers property must be not empty";
    export const RESPONSETRIGGERS_ATLEASTONE = "You must define at least one trigger";
    export const TRIGGERTYPE_MISSING = "You must define trigger type. The trigger type property must be not empty";
    export const TRIGGERTYPE_INVALID = "The trigger type must match with one of the following values: data, sequential, random, validate, none";
    export const TRIGGERACTIONS_MISSING = "You must define trigger actions. The trigger actions property must be not empty";
    export const TRIGGERACTIONS_ATLEASTONE = "You must define at least one action";
    export const ACTIONTYPE_MISSING = "You must define action type. The action type property must be not empty";
    export const ACTIONTYPE_INVALID = "The action type must match with one of the following values: message, save, wait, microservice";

    export const BASICAUTHENTICATIONUSERNAME_MISSING = "You must define basic authentication username. The basic authentication username property must be not empty";
    export const BASICAUTHENTICATIONPASSWORD_MISSING = "You must define basic authentication password. The basic authentication password property must be not empty";
    export const APIKEYAUTHENTICATIONSOURCE_MISSING = "You must define api key authentication source. The api key authentication source property must be not empty";
    export const APIKEYAUTHENTICATIONSOURCE_INVALID = "The api key authentication source must match with one of the following values: HEADER, QUERY";
    export const APIKEYAUTHENTICATIONKEYNAME_MISSING = "You must define api key authentication keyname. The api key authentication keyname property must be not empty";
    export const APIKEYAUTHENTICATIONKEYVALUE_MISSING = "You must define api key authentication keyvalue. The api key authentication keyvalue property must be not empty";

    export const DATATRIGGERCONDITIONS_MISSING = "You must define data trigger conditions. The data trigger conditions property must be not empty";
    export const DATATRIGGERCONDITIONS_ATLEASTONE = "You must define at least one condition";
    export const DATATRIGGERCONDITION_LEFTOPERANDMISSING = "For each data condition, you must define the left operand property";
    export const DATATRIGGERCONDITION_RIGHTOPERANDMISSING = "For each data condition, you must define the right operand property";
    export const DATATRIGGERCONDITION_OPERATIONMISSING = "For each data condition, you must define the operation property";
    export const DATATRIGGERCONDITION_INVALIDOPERATION = "For each data condition, the operation must be equals to EQUALS, NOT_EQUALS, MATCHES, NOT_MATCHES";
    export const RANDOMTRIGGERPROBABILITY_MISSING = "You must define random trigger probability. The random trigger probability property must be not empty";
    export const VALIDATETRIGGERMANDATORIESFIELDS_MISSING = "You must define validate trigger mandatories fields. The validate trigger mandatories fields property must be not empty";
    export const VALIDATETRIGGERMANDATORIESFIELDS_ATLEASTONE = "You must define at least one mandatory field";

    export const MESSAGEACTIONBODY_DEFINED2TIMES = "You can't define body and bodyFile properties for the same action";
    export const SAVEACTIONSTORAGE_MISSING = "You must define save action storage. The save action storage property must be not empty";
    export const SAVEACTIONSKEYS_MISSING = "You must define save action keys. The save action keys property must be not empty";
    export const SAVEACTIONSKEYS_ATLEASTONE = "You must define at least one key";
    export const SAVEACTIONSEXPRESSIONS_MISSING = "You must define save action expressions. The save action expressions property must be not empty";
    export const SAVEACTIONSEXPRESSIONS_ATLEASTONE = "You must define at least one expression";
    export const WAITACTIONTIMEOUT_MISSING = "You must define wait action timeout. The wait action timeout property must be not empty";
    export const MICROSERVICEACTIONACTION_MISSING = "You must define microservice action. The microservice action property must be not empty";
    export const MICROSERVICEACTIONACTION_INVALID = "The microservice action must match with one of the following values: getall, get, create, update, delete";
    export const MICROSERVICEACTIONSTORAGE_MISSING = "You must define microservice storage. The microservice storage property must be not empty";
    export const MICROSERVICEACTIONIDENTIFIER_MISSING = "You must define microservice identifier. The microservice identifier property must be not empty";
    export const MICROSERVICEACTIONIDENTIFIERID_MISSING = "You must define microservice identifier id. The microservice identifier id property must be not empty";
    export const MICROSERVICEACTIONIDENTIFIERNAME_MISSING = "You must define microservice identifier value. The microservice identifier value property must be not empty";
}

export module WARNING {
    export const SERVICEMETHOD_MISSING = "If you not defined service method, by default the system will use GET method";
    export const SERVICEPATH_MISSING = "If you not defined path, by default the system will use / value";
    export const MESSAGEACTIONSTATUS = "If you not defined status, by default the system will use 200 value";
}

export module HTTP_METHODS {
    export const GET = "GET";
    export const HEAD = "HEAD";
    export const POST = "POST";
    export const PUT = "PUT";
    export const DELETE = "DELETE";
    export const CONNECT = "CONNECT";
    export const OPTIONS = "OPTIONS";
    export const TRACE = "TRACE";
    export const PATCH = "PATCH";
}

export module AUTHENTICATION_TYPE {
    export const BASIC_AUTHENTICATION = "BASIC";
    export const APIKEY_AUTHENTICATION = "APIKEY";
}

export module IDGENERATION_TYPE {
    export const NEWINTEGERID = "NewIntegerId";
    export const NEWUUID = "NewUUID";
}

export module CONDITION_OPERATION {
    export const EQUALS = "EQUALS";
    export const NOT_EQUALS = "NOT_EQUALS";
    export const MATCHES = "MATCHES";
    export const NOT_MATCHES = "NOT_MATCHES";
}