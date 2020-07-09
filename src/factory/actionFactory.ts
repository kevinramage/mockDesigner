import { IMockAction } from "../interface/mockAction";
import { IMockMessageAction } from "../interface/mockMessageAction";
import { ServiceMessage } from "../business/action/serviceMessage";
import { ServiceMessageHeader } from "../business/action/serviceMessageHeader";
import { IMockSaveAction } from "../interface/mockSaveAction";
import { ServiceSave } from "../business/action/serviceSave";
import { IMockMicroServiceAction } from "../interface/mockMicroServiceAction";
import { ServiceMicroService } from "../business/action/serviceMicroService";
import { ServiceWait } from "../business/action/serviceWait";
import { IMockWaitAction } from "../interface/mockWaitAction";
import { IServiceAction } from "business/action/serviceAction";

export class ActionFactory {

    public static build(actionInterface: IMockAction) : IServiceAction | null {
        switch ( actionInterface.type ) {
            case "message":
                return ActionFactory.buildMessageAction(actionInterface as IMockMessageAction);
            case "save":
                return ActionFactory.buildSaveAction(actionInterface as IMockSaveAction);
            case "microservice":
                return ActionFactory.buildMicroServiceAction(actionInterface as IMockMicroServiceAction);
            case "wait":
                return ActionFactory.buildWaitAction(actionInterface as IMockWaitAction);
            default:
                return null;
        }
    }

    private static buildMessageAction(actionInterface: IMockMessageAction) {
        const serviceMessage : ServiceMessage = new ServiceMessage();
        serviceMessage.status = actionInterface.status;
        if ( actionInterface.headers ) {
            Object.entries(actionInterface.headers).forEach(data => {
                const header = new ServiceMessageHeader();
                header.key = data[0];
                header.value = data[1] as string;
                serviceMessage.addHeader(header);
            });
        }
        serviceMessage.bodyFileName = actionInterface.bodyFile;
        serviceMessage.body = actionInterface.body;
        return serviceMessage;
    }

    private static buildSaveAction(actionInterface: IMockSaveAction) {
        const serviceSave : ServiceSave = new ServiceSave();
        
        // Expression
        actionInterface.expressions.forEach(exp => {
            serviceSave.addExpression(exp.key, exp.value);
        });

        // Storage
        serviceSave.storage = actionInterface.storage;

        // Keys
        actionInterface.keys.forEach(key => {
            serviceSave.addKey(key); 
        });

        return serviceSave;
    }

    private static buildMicroServiceAction(actionInterface: IMockMicroServiceAction) {
        const serviceMicroService = new ServiceMicroService();

        // Action
        serviceMicroService.action = actionInterface.action;

        // Storage
        serviceMicroService.storage = actionInterface.storage;

        // Data
        if ( actionInterface.data ) {
            serviceMicroService.data = actionInterface.data;
        }

        // Expiration
        if ( actionInterface.expiration ) {
            serviceMicroService.expiration = actionInterface.expiration;
        }

        return serviceMicroService;
    }

    private static buildWaitAction(actionInterface: IMockWaitAction) {
        const serviceWait = new ServiceWait();

        // Time
        serviceWait.time = actionInterface.time;

        return serviceWait;
    }
}