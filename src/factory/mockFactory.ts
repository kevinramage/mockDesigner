import { Mock } from "../business/mock";
import { IMock } from "../interface/mock";
import { ServiceFactory } from "./serviceFactory";
import { ActionFactory } from "./actionFactory";

export class MockFactory {

    public static build (mockInterface: IMock) {
        const mock : Mock = new Mock();
        mock.name = mockInterface.name;

        // Service
        mockInterface.services.forEach(serviceInterface => {
            const serviceGroup = ServiceFactory.build(serviceInterface);
            if ( serviceGroup ) {
                mock.addServiceGroup(serviceGroup); 
            }
        });

        // Default route
        if ( mockInterface.default ) {
            mockInterface.default.forEach(actionInterface => {
                const action = ActionFactory.build(actionInterface);
                if ( action ) {
                    mock.addDefaultAction(action);
                }
            });
        }

        // Default error handling
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