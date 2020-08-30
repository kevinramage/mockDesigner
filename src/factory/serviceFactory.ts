import { IMockService } from "../interface/mockService";
import { Service } from "../business/service";
import { ServiceWithoutTrigger } from "../business/trigger/serviceWithoutTrigger";
import { ActionFactory } from "./actionFactory";
import { AUTHENTICATION_TYPE, HTTP_METHODS } from "../constantes";
import { BasicAuthentication } from "../business/authentication/basicAuthentication";
import { ApiKeyAuthentication } from "../business/authentication/apiKeyAuthentication";
import { IMockDataTrigger } from "../interface/mockDataTrigger";
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
import { IMockValidationTrigger } from "../interface/mockValidationTrigger";
import { ServiceValidation } from "../business/trigger/serviceValidation";
import { IMockBasicAuthentication } from "interface/mockBasicAuthentication";
import { IMockApiKeyAuthentication } from "interface/mockApiKeyAuthentication";
import { IMockDataTriggerCondition } from "interface/mockDataTriggerCondition";
import { Condition } from "../templates/condition";

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
        service.route.path = serviceInterface.path || "/";
        if ( serviceInterface.method ) {
            service.route.method = serviceInterface.method;
        } else {
            service.route.method = (service.soapAction) ? HTTP_METHODS.POST : HTTP_METHODS.GET;
        }
        if ( serviceInterface.pingPath ) {
            service.route.pingPath = serviceInterface.pingPath;
        } else {
            service.route.pingPath = serviceInterface.path;
        }

        // Triggers
        const instance = this;
        serviceInterface.response.triggers.forEach(trigger => {
            switch ( trigger.type ) {
                case "none":
                    service.addTrigger(instance.buildWithoutTrigger(trigger));
                break;
                case "data":
                    service.addTrigger(instance.buildDataTrigger(trigger as IMockDataTrigger));
                break;
                case "check":
                    service.addTrigger(instance.buildCheckTrigger(trigger as IMockCheckTrigger));
                break;
                case "random":
                    service.addTrigger(instance.buildRandomTrigger(trigger as IMockRandomTrigger));
                break;
                case "sequential":
                    service.addTrigger(instance.buildSequentialTrigger(trigger as IMockSequentialTrigger));
                break;
                case "validate":
                    service.addTrigger(instance.buildValidationTrigger(trigger as IMockValidationTrigger));
                break;
            }
        });

        // Authentication
        if ( serviceInterface.authentication ) {
            switch ( serviceInterface.authentication.type ) {
                case AUTHENTICATION_TYPE.BASIC_AUTHENTICATION:
                    const mockBasicAuthentication = serviceInterface.authentication as IMockBasicAuthentication;
                    const basicAuthentication = new BasicAuthentication();
                    basicAuthentication.username = mockBasicAuthentication.userName;
                    basicAuthentication.password = mockBasicAuthentication.password;
                    service.authentication = basicAuthentication;
                break;
                case AUTHENTICATION_TYPE.APIKEY_AUTHENTICATION:
                    const mockApiKeyAuthentication = serviceInterface.authentication as IMockApiKeyAuthentication;
                    const apiKeyAuthentication = new ApiKeyAuthentication();
                    apiKeyAuthentication.source = mockApiKeyAuthentication.source;
                    apiKeyAuthentication.keyName = mockApiKeyAuthentication.keyName;
                    apiKeyAuthentication.keyValue = mockApiKeyAuthentication.keyValue;
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

        // Monitoring
        if ( serviceInterface.requestStorage && serviceInterface.requestStorage.keys ) {
            serviceInterface.requestStorage.keys.forEach(key => {
                service.addRequestStorageKey(key);
            });
            if ( serviceInterface.requestStorage.expiration ) {
                service.requestStorageExpiration = serviceInterface.requestStorage.expiration;
            }
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

    private static buildDataTrigger(dataTrigger: IMockDataTrigger) {
        const instance = this;
        const serviceDataTrigger = new ServiceData();

        // Expression
        dataTrigger.conditions.forEach(condition => {
            const conditionService = instance.buildDataTriggerCondition(condition);
            serviceDataTrigger.addCondition(conditionService);
        });

        // Actions
        dataTrigger.actions.forEach(action => {
            const actionBuilt = ActionFactory.build(action);
            if ( actionBuilt != null ) {
                serviceDataTrigger.addAction(actionBuilt);
            }
        });

        return serviceDataTrigger;
    }

    private static buildDataTriggerCondition(condition: IMockDataTriggerCondition) {
        const serviceCondition : Condition = new Condition();

        // Left operand
        serviceCondition.leftOperand = condition.leftOperand;

        // Operation
        serviceCondition.operation = condition.operation;

        // Right operand
        serviceCondition.rightOperand = condition.rightOperand;
        
        return serviceCondition;
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

    private static buildValidationTrigger(dataValidation: IMockValidationTrigger) {
        const serviceValidationTrigger = new ServiceValidation();

        // Mandatories fields
        if ( dataValidation.mandatoriesFields ) {
            dataValidation.mandatoriesFields.forEach(f => {
                serviceValidationTrigger.addMandoryField(f);
            });
        }

        // Actions
        dataValidation.actions.forEach(action => {
            const actionBuilt = ActionFactory.build(action);
            if ( actionBuilt != null ) {
                serviceValidationTrigger.addAction(actionBuilt);
            }
        });

        return serviceValidationTrigger;
    }
}