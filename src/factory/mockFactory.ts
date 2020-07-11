import { Mock } from "../business/mock";
import { IMock } from "../interface/mock";
import { ServiceFactory } from "./serviceFactory";
import { ActionFactory } from "./actionFactory";
import { type } from "os";

export class MockFactory {

    public static build (mockInterface: IMock) {
        const mock : Mock = new Mock();
        mock.name = mockInterface.name;
        mockInterface.services.forEach(serviceInterface => {
            const service = ServiceFactory.build(serviceInterface);
            mock.addService(service); 
        });
        if ( mockInterface.default ) {
            mockInterface.default.forEach(actionInterface => {
                const action = ActionFactory.build(actionInterface);
                if ( action ) {
                    mock.addDefaultAction(action);
                }
            });
        }
        if ( mockInterface.error ) {
            mockInterface.error.forEach(actionInterface => {
                const action = ActionFactory.build(actionInterface);
                if ( action ) {
                    mock.addErrorAction(action);
                }
            });
        }
        return mock;
    }
}