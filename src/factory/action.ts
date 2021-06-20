import { Action } from "../business/project/action";
import { ActionMessage } from "../business/project/action/message";
import { WaitAction } from "../business/project/action/wait";
import { ACTIONS } from "../business/utils/enum";
import { IAction } from "../interface/action";
import { IMessageAction } from "../interface/actions/messageAction";
import { IWaitAction } from "../interface/actions/waitAction";

export class ActionFactory {

    public static build(actionData : IAction, workspace: string) : Action | null{
        if ( actionData.type.toUpperCase() == ACTIONS.MESSAGE ) {
            return ActionFactory.buildMessageAction(actionData as IMessageAction, workspace);
        } else if ( actionData.type.toUpperCase() == ACTIONS.WAIT ) {
            return ActionFactory.buildWaitAction(actionData as IWaitAction, workspace);
        } else {
            return null;
        }
    }

    private static buildMessageAction(actionData: IMessageAction, workspace: string) {
        const action = new ActionMessage(workspace);

        if (actionData.status) { action.status = actionData.status; }
        if (actionData.headers) {
            Object.entries(actionData.headers).forEach((values) => {
                action.addHeader(values[0], values[1]);
            });
        }
        if (actionData.body) { action.bodyText = actionData.body; }
        if (actionData.bodyFile) { action.bodyFile = actionData.bodyFile; }
        if (actionData.template) { action.template = actionData.template; }

        return action;
    }

    private static buildWaitAction(actionData: IWaitAction, workspace: string) {
        const action = new WaitAction();

        if (actionData.time) { action.time = actionData.time; }

        return action;
    }
}