import { IMockAction } from "../interface/mockAction";
import { IMockMessageAction } from "../interface/mockMessageAction";
import { ServiceMessage } from "../business/action/serviceMessage";
import { ServiceMessageHeader } from "../business/action/serviceMessageHeader";

export class ActionFactory {

    public static build(actionInterface: IMockAction) {
        return ActionFactory.buildMessageAction(actionInterface as IMockMessageAction);
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
}