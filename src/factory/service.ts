import { Service } from "../business/project/service";
import { IService } from "../interface/service";
import { AuthenticationFactory } from "./authentication";
import { ResponseFactory } from "./response";

export class ServiceFactory {

    public static build (serviceData : IService, workspace: string) {
        const service = new Service(workspace);

        if (serviceData.method) { service.method = serviceData.method }
        if (serviceData.name) { service.name = serviceData.name; }
        if (serviceData.path) { service.path = serviceData.path; }
        if (serviceData.response) {
            service.response = ResponseFactory.build(serviceData.response, workspace); 
        }
        if (serviceData.authentication) {
            const authentication = AuthenticationFactory.build(serviceData.authentication);
            if (authentication) {
                service.authentication = authentication;
            }
        }

        return service;
    }
}