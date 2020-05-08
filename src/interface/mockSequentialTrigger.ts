import { IMockSequentialTriggerMessage } from "./mockSequentialTriggerMessage";
import { IMockTrigger } from "./mockTrigger";

export interface IMockSequentialTrigger extends IMockTrigger {
    type: "sequential";
    messages: IMockSequentialTriggerMessage[];
}