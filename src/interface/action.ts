import { IMessageAction } from "./actions/messageAction";
import { ISaveAction } from "./actions/saveAction";
import { IWaitAction } from "./actions/waitAction";

export type IAction = IMessageAction | IWaitAction | ISaveAction;