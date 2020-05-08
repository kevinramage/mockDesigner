import { IMockAction } from "./mockAction";

export interface IMockSequentialTriggerMessage {
    repeat: number;
    actions: IMockAction[];
}