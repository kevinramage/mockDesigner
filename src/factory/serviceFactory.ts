import { IMockService } from "../interface/mockService";
import { Service } from "../business/service";
import { ServiceWithoutTrigger } from "../business/trigger/serviceWithoutTrigger";
import { ActionFactory } from "./actionFactory";
import { AUTHENTICATION_TYPE } from "../constantes";
import { BasicAuthentication } from "../business/authentication/BasicAuthentication";
import { ApiKeyAuthentication } from "../business/authentication/ApiKeyAuthentication";

export class ServiceFactory {

    public static build(serviceInterface: IMockService) {
        const service : Service = new Service();
        service.name = serviceInterface.name;

        // Route
        service.route.path = serviceInterface.path;
        if ( serviceInterface.method ) {
            service.route.method = serviceInterface.method;
        }

        // Trigger
        const trigger = new ServiceWithoutTrigger();
        serviceInterface.response.actions.forEach(action => {
            const actionBuilt = ActionFactory.build(action);
            if ( actionBuilt != null ) {
                trigger.addAction(actionBuilt);
            }
        });
        service.trigger = trigger;

        // Authentication
        if ( serviceInterface.authentication ) {
            switch ( serviceInterface.authentication.type ) {
                case AUTHENTICATION_TYPE.BASIC_AUTHENTICATION:
                    const basicAuthentication = new BasicAuthentication();
                    basicAuthentication.username = serviceInterface.authentication.userName;
                    basicAuthentication.password = serviceInterface.authentication.password;
                    service.authentication = basicAuthentication;
                break;
                case AUTHENTICATION_TYPE.APIKEY_AUTHENTICATION:
                    const apiKeyAuthentication = new ApiKeyAuthentication();
                    apiKeyAuthentication.source = serviceInterface.authentication.source;
                    apiKeyAuthentication.keyName = serviceInterface.authentication.keyName;
                    apiKeyAuthentication.keyValue = serviceInterface.authentication.keyValue;
                    service.authentication = apiKeyAuthentication;
                break;
            }
        }

        return service;
    }
}