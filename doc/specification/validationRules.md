# Validation rules

* ERROR_MOCKNAME_MISSING: You must define a mock name. The name property must be not empty
* ERROR_MOCKSERVICES_MISSING: You must define a mock services. The services property must be not empty
* ERROR_MOCKSERVICES_ATLEASTONE: You must define at least one service
* ERROR_SERVICENAME_MISSING: You must define a service name. The service name property must be not empty
* WARNING_SERVICEMETHOD_MISSING: If you not defined service method, by default the system will use GET method
* ERROR_SERVICEMETHOD_INVALID: The service method must match with one of the following values: GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH
* WARNING_SERVICEPATH_MISSING: If you not defined path, by default the system will use / value
* ERROR_AUTHENTICATIONTYPE_MISSING: You must define a authentication type. The authentication type property must be not empty
* ERROR_AUTHENTICATIONTYPE_INVALID: The service authentication must match with one of the following values: BASIC, APIKEY
* ERROR_SERVICERESPONSE_MISSING: You must define a service response. The service response property must be not empty
* ERROR_RESPONSETRIGGERS_MISSING: You must define a response triggers. The response triggers property must be not empty
* ERROR_RESPONSETRIGGERS_ATLEASTONE: You must define at least one trigger
* ERROR_TRIGGERTYPE_MISSING: You must define a trigger type. The trigger type property must be not empty
* ERROR_TRIGGERTYPE_INVALID: The trigger type must match with one of the following values: data, sequential, random, validate, none
* ERROR_TRIGGERACTIONS_MISSING: You must define trigger actions. The trigger actions property must be not empty
* ERROR_TRIGGERACTIONS_ATLEASTONE: You must define at least one action
* ERROR_ACTIONTYPE_MISSING: You must define action type. The action type property must be not empty
* ERROR_ACTIONTYPE_INVALID: The action type must match with one of the following values: message, save, wait, microservice

## Authentication
* ERROR_BASICAUTHENTICATIONUSERNAME_MISSING: You must define basic authentication username. The basic authentication username property must be not empty
* ERROR_BASICAUTHENTICATIONPASSWORD_MISSING: You must define basic authentication password. The basic authentication password property must be not empty
* ERROR_APIKEYAUTHENTICATIONSOURCE_MISSING: You must define api key authentication source. The api key authentication source property must be not empty
* ERROR_APIKEYAUTHENTICATIONSOURCE_INVALID: The api key authentication source must match with one of the following values: HEADER, QUERY
* ERROR_APIKEYAUTHENTICATIONKEYNAME_MISSING: You must define api key authentication keyname. The api key authentication keyname property must be not empty
* ERROR_APIKEYAUTHENTICATIONKEYVALUE_MISSING: You must define api key authentication keyvalue. The api key authentication keyvalue property must be not empty

## Trigger
* ERROR_DATATRIGGERCONDITIONS_MISSING: You must define data trigger conditions. The data trigger conditions property must be not empty
* ERROR_DATATRIGGERCONDITIONS_ATLEASTONE: You must define at least one condition
* ERROR_RANDOMTRIGGERPROBABILITY_MISSING: You must define random trigger probability. The random trigger probability property must be not empty
* ERROR_VALIDATETRIGGERMANDATORIESFIELDS_MISSING: You must define validate trigger mandatories fields. The validate trigger mandatories fields property must be not empty
* ERROR_VALIDATETRIGGERMANDATORIESFIELDS_ATLEASTONE: You must define at least one mandatory field

## Action
* WARNING_MESSAGEACTIONSTATUS: If you not defined status, by default the system will use 200 value
* ERROR_MESSAGEACTIONBODY_DEFINED2TIMES: You can't define body and bodyFile properties for the same action
* ERROR_SAVEACTIONSTORAGE_MISSING: You must define save action storage. The save action storage property must be not empty
* ERROR_SAVEACTIONSKEYS_MISSING: You must define save action keys. The save action keys property must be not empty
* ERROR_SAVEACTIONSKEYS_ATLEASTONE: You must define at least one key
* ERROR_SAVEACTIONSEXPRESSIONS_MISSING: You must define save action expressions. The save action expressions property must be not empty
* ERROR_SAVEACTIONSEXPRESSIONS_ATLEASTONE: You must define at least one expression
* ERROR_WAITACTIONTIMEOUT_MISSING: You must define wait action timeout. The wait action timeout property must be not empty
* ERROR_MICROSERVICEACTIONACTION_MISSING: You must define microservice action. The microservice action property must be not empty
* ERROR_MICROSERVICEACTIONACTION_INVALID: The microservice action must match with one of the following values: getall, get, create, update, delete
* ERROR_MICROSERVICEACTIONSTORAGE_MISSING: You must define microservice storage. The microservice storage property must be not empty
* ERROR_MICROSERVICEACTIONIDENTIFIER_MISSING: You must define microservice identifier. The microservice identifier property must be not empty
* ERROR_MICROSERVICEACTIONIDENTIFIERID_MISSING: You must define microservice identifier id. The microservice identifier id property must be not empty
* ERROR_MICROSERVICEACTIONIDENTIFIERNAME_MISSING: You must define microservice identifier value. The microservice identifier value property must be not empty
