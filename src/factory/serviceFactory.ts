import { IMockService } from "../interface/mockService";
import { Service } from "../business/service";
import { ServiceWithoutTrigger } from "../business/trigger/serviceWithoutTrigger";
import { ActionFactory } from "./actionFactory";

export class ServiceFactory {

    public static build(serviceInterface: IMockService) {
        const service : Service = new Service();
        service.name = serviceInterface.name;
        service.route.path = serviceInterface.path;
        if ( serviceInterface.method ) {
            service.route.method = serviceInterface.method;
        }
        const trigger = new ServiceWithoutTrigger();
        serviceInterface.response.actions.forEach(action => {
            trigger.addAction(ActionFactory.build(action));
        });
        service.trigger = trigger;
        return service;
    }
}