import { IMessageAction } from "./actions/messageAction";
import { IWaitAction } from "./actions/waitAction";

export type IAction = IMessageAction | IWaitAction;