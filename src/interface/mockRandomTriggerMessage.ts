import { IMockAction } from "./mockAction";

export interface IMockRandomTriggerMessage {
    probability ?: number,
    actions : IMockAction[];
}