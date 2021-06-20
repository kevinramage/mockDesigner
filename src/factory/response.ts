import { Response } from "../business/project/response";
import { IResponse } from "../interface/response";
import { BehaviourFactory } from "./behaviour";
import { TriggerFactory } from "./trigger";

export class ResponseFactory {

    public static build(responseData: IResponse, workspace: string) {
        const response = new Response();
        if (responseData.triggers) {
            responseData.triggers.forEach(triggerData => {
                const trigger = TriggerFactory.build(triggerData, workspace);
                if (trigger) {
                    response.addTrigger(trigger);
                }
            });
        }
        if (responseData.behaviours) {
            responseData.behaviours.forEach(behaviourData => {
                const behaviour = BehaviourFactory.build(behaviourData, workspace);
                response.addBehaviour(behaviour);
            });
        }
        return response;
    }
}