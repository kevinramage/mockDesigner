import { IMockService } from "../interface/mockService";
import { Service } from "../business/service";
import { ServiceWithoutTrigger } from "../business/trigger/serviceWithoutTrigger";
import { ActionFactory } from "./actionFactory";
import { AUTHENTICATION_TYPE, HTTP_METHODS } from "../constantes";
import { BasicAuthentication } from "../business/authentication/BasicAuthentication";
import { ApiKeyAuthentication } from "../business/authentication/ApiKeyAuthentication";
import { IMockDataTriger } from "../interface/mockDataTrigger";
import { ServiceData } from "../business/trigger/serviceData";
import { IMockCheckTrigger } from "../interface/mockCheckTrigger";
import { ServiceCheck } from "../business/trigger/serviceCheck";
import { IMockTrigger } from "../interface/mockTrigger";
import { IMockRandomTrigger } from "../interface/mockRandomTrigger";
import { ServiceRandom } from "../business/trigger/serviceRandom";
import { IMockRandomTriggerMessage } from "../interface/mockRandomTriggerMessage";
import { ServiceRandomMessage } from "../business/trigger/serviceRandomMessage";
import { IMockSequentialTrigger } from "../interface/mockSequentialTrigger";
import { IMockSequentialTriggerMessage } from "../interface/mockSequentialTriggerMessage";
import { ServiceSequentialMessage } from "../business/trigger/serviceSequentialTriggerMessage";
import { ServiceSequential } from "../business/trigger/serviceSequential";
import { BehaviourFactory } from "./behaviourFactory";

export class ServiceFactory {

    public static build(serviceInterface: IMockService) {
        const service : Service = new Service();
        service.name = serviceInterface.name;

        // Soap action
        if ( serviceInterface.soapAction ) {
            service.soapAction = serviceInterface.soapAction;
        }

        // Delay
        if ( serviceInterface.delay ) {
            service.delay = serviceInterface.delay;
        }

        // Route
        service.route.path = serviceInterface.path;
        if ( serviceInterface.method ) {
            service.route.method = serviceInterface.method;
        } else {
            service.route.method = (service.soapAction) ? HTTP_METHODS.POST : HTTP_METHODS.GET;
        }

        // Triggers
        const instance = this;
        serviceInterface.response.triggers.forEach(trigger => {
            switch ( trigger.type ) {
                case "none":
                    service.addTrigger(instance.buildWithoutTrigger(trigger));
                break;
                case "data":
                    service.addTrigger(instance.buildDataTrigger(trigger as IMockDataTriger));
                break;
                case "check":
                    service.addTrigger(instance.buildCheckTrigger(trigger as IMockCheckTrigger));
                break;
                case "random":
                    service.addTrigger(instance.buildRandomTrigger(trigger as IMockRandomTrigger));
                break;
                case "sequential":
                    service.addTrigger(instance.buildSequentialTrigger(trigger as IMockSequentialTrigger ));
                break;
            }
        });

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

        // Behaviours
        if ( serviceInterface.response.behaviours) {
            serviceInterface.response.behaviours.forEach(behaviour => {
                service.addBehaviour(BehaviourFactory.build(behaviour));
            });
        }

        return service;
    }

    private static buildWithoutTrigger(dataTrigger: IMockTrigger) {
        const serviceWithoutTrigger = new ServiceWithoutTrigger();

        // Actions
        dataTrigger.actions.forEach(action => {
            const actionBuilt = ActionFactory.build(action);
            if ( actionBuilt != null ) {
                serviceWithoutTrigger.addAction(actionBuilt);
            }
        });

        return serviceWithoutTrigger;
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

    private static buildCheckTrigger(dataTrigger: IMockCheckTrigger) {

        const serviceCheckTrigger = new ServiceCheck();

        // Mandatories
        dataTrigger.mandatories.forEach(mandatory => {
            serviceCheckTrigger.addMandatory(mandatory);
        });

        // Actions
        dataTrigger.actions.forEach(action => {
            const actionBuilt = ActionFactory.build(action);
            if ( actionBuilt != null ) {
                serviceCheckTrigger.addAction(actionBuilt);
            }
        });

        return serviceCheckTrigger;
    }

    private static buildRandomTrigger(randomTrigger: IMockRandomTrigger) {

        const serviceRandom = new ServiceRandom();

        // Messages
        randomTrigger.messages.forEach(msg => {
            serviceRandom.addMessage(ServiceFactory.buildRandomTriggerMessage(msg));
        });

        return serviceRandom;
    }

    private static buildRandomTriggerMessage(randomTriggerMessage: IMockRandomTriggerMessage) {

        const serviceRandomMessage = new ServiceRandomMessage();

        // Probability
        if ( randomTriggerMessage.probability ) {
            serviceRandomMessage.probability = randomTriggerMessage.probability;
        }

        // Actions
        randomTriggerMessage.actions.forEach(action => {
            const actionBuilt = ActionFactory.build(action);
            if ( actionBuilt != null ) {
                serviceRandomMessage.addAction(actionBuilt);
            }
        });

        return serviceRandomMessage;
    }

    private static buildSequentialTrigger(dataSequential: IMockSequentialTrigger) {
        const serviceSequential = new ServiceSequential();

        // Messages
        dataSequential.messages.forEach(msg => {
            serviceSequential.addMessage(ServiceFactory.buildSequentialTriggerMessage(msg));
        });

        return serviceSequential;
    }

    private static buildSequentialTriggerMessage(dataMessage: IMockSequentialTriggerMessage) {
        const serviceSequentialMessage = new ServiceSequentialMessage();

        // Repeat
        if ( dataMessage.repeat ) {
            serviceSequentialMessage.repeat = dataMessage.repeat;
        }

        // Actions
        dataMessage.actions.forEach(action => {
            const actionBuilt = ActionFactory.build(action);
            if ( actionBuilt != null ) {
                serviceSequentialMessage.addAction(actionBuilt);
            }
        });

        return serviceSequentialMessage;
    }
}