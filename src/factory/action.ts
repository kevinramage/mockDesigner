import { Action } from "../business/project/action";
import { ActionMessage } from "../business/project/action/message";
import { ACTIONS } from "../business/utils/enum";
import { IAction } from "../interface/action";

export class ActionFactory {

    public static build(actionData : IAction, workspace: string) : Action | null{
        if ( actionData.type.toUpperCase() == ACTIONS.MESSAGE ) {
            return ActionFactory.buildActionMessage(actionData, workspace);
        } else {
            return null;
        }
    }

    private static buildActionMessage(actionData: IAction, workspace: string) {
        const action = new ActionMessage(workspace);

        if (actionData.status) { action.status = actionData.status; }
        if (actionData.headers) {
            Object.entries(actionData.headers).forEach((values) => {
                action.addHeader(values[0], values[1]);
            });
        }
        if (actionData.body) { action.bodyText = actionData.body; }
        if (actionData.bodyFile) { action.bodyFile = actionData.bodyFile; }

        return action;
    }
}