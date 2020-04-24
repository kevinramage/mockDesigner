import { Mock } from "../business/mock";
import { IMock } from "../interface/mock";
import { ServiceFactory } from "./serviceFactory";

export class MockFactory {

    public static build (mockInterface: IMock) {
        const mock : Mock = new Mock();
        mock.name = mockInterface.name;
        mockInterface.services.forEach(serviceInterface => {
            const service = ServiceFactory.build(serviceInterface);
            mock.addService(service); 
        });
        return mock;
    }
}