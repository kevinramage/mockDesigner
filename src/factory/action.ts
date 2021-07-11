import { Action } from "../business/project/action";
import { ActionMessage } from "../business/project/action/message";
import { SaveAction, SaveExpression } from "../business/project/action/save";
import { WaitAction } from "../business/project/action/wait";
import { ACTIONS } from "../business/utils/enum";
import { IAction } from "../interface/action";
import { IMessageAction } from "../interface/actions/messageAction";
import { ISaveAction, ISaveExpression } from "../interface/actions/saveAction";
import { IWaitAction } from "../interface/actions/waitAction";

export class ActionFactory {

    public static build(actionData : IAction, workspace: string) : Action | null{
        if ( actionData.type.toUpperCase() == ACTIONS.MESSAGE ) {
            return ActionFactory.buildMessageAction(actionData as IMessageAction, workspace);
        } else if ( actionData.type.toUpperCase() == ACTIONS.WAIT ) {
            return ActionFactory.buildWaitAction(actionData as IWaitAction, workspace);
        } else if ( actionData.type.toUpperCase() == ACTIONS.SAVE ) {
            return ActionFactory.buildSaveAction(actionData as ISaveAction, workspace);
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
        
        // Set template if body file defined with jsonx extension
        if (!actionData.template && action.bodyFile && action.bodyFile.toLowerCase().endsWith("jsonx")) {
            action.template = true;
        }

        return action;
    }

    private static buildWaitAction(actionData: IWaitAction, workspace: string) {
        const action = new WaitAction();

        if (actionData.time) { action.time = actionData.time; }

        return action;
    }

    private static buildSaveAction(actionData: ISaveAction, workspace: string) {
        const action = new SaveAction();

        if (actionData.key) { action.key = actionData.key; }
        if (actionData.expressions) {
            actionData.expressions.forEach((exp) => {
                const expression = ActionFactory.buildSaveExpression(exp, workspace);
                action.addExpression(expression);
            });
        }

        return action;
    }

    private static buildSaveExpression(expressionData: ISaveExpression, workspace: string) {
        const expression = new SaveExpression();

        if (expressionData.key) { expression.key = expressionData.key; }
        if (expressionData.value) { expression.value = expressionData.value; }

        return expression;
    }
}