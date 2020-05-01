import { IMockService } from "../interface/mockService";
import { Service } from "../business/service";
import { ServiceWithoutTrigger } from "../business/trigger/serviceWithoutTrigger";
import { ActionFactory } from "./actionFactory";
import { AUTHENTICATION_TYPE, HTTP_METHODS } from "../constantes";
import { BasicAuthentication } from "../business/authentication/BasicAuthentication";
import { ApiKeyAuthentication } from "../business/authentication/ApiKeyAuthentication";
import { IMockDataTriger } from "../interface/mockDataTrigger";
import { ServiceData } from "../business/trigger/serviceData";

export class ServiceFactory {

    public static build(serviceInterface: IMockService) {
        const service : Service = new Service();
        service.name = serviceInterface.name;

        // Soap action
        if ( serviceInterface.soapAction ) {
            service.soapAction = serviceInterface.soapAction;
        }

        // Route
        service.route.path = serviceInterface.path;
        if ( serviceInterface.method ) {
            service.route.method = serviceInterface.method;
        } else {
            service.route.method = (service.soapAction) ? HTTP_METHODS.POST : HTTP_METHODS.GET;
        }

        // Default trigger if no triggers defined
        if ( !serviceInterface.response.triggers) {
            const trigger = new ServiceWithoutTrigger();
            serviceInterface.response.actions.forEach(action => {
                const actionBuilt = ActionFactory.build(action);
                if ( actionBuilt != null ) {
                    trigger.addAction(actionBuilt);
                }
            });
            service.addTrigger(trigger);

        // Triggers
        } else {
            const instance = this;
            serviceInterface.response.triggers.forEach(trigger => {
                switch ( trigger.type ) {
                    case "data":
                        service.addTrigger(instance.buildDataTrigger(trigger as IMockDataTriger));
                    break;
                }
            });
        }

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

    private static buildDataTrigger(dataTrigger: IMockDataTriger) {

        const serviceDataTrigger = new ServiceData();

        // Expression
        serviceDataTrigger.expression = dataTrigger.expression;

        // Actions
        dataTrigger.actions.forEach(action => {
            const actionBuilt = ActionFactory.build(action);
            if ( actionBuilt != null ) {
                serviceDataTrigger.addAction(actionBuilt);
            }
        });

        return serviceDataTrigger;
    }
}