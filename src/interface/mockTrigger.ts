import { IMockAction } from "./mockAction";

export interface IMockTrigger {
    type: string;
    actions: IMockAction[];
}