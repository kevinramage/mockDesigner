import { IMockRandomTriggerMessage } from "./mockRandomTriggerMessage";
import { IMockTrigger } from "./mockTrigger";

export interface IMockRandomTrigger extends IMockTrigger {
    type: "random",
    messages: IMockRandomTriggerMessage[]
}