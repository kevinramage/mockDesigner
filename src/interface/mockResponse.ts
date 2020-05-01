import { IMockAction } from "./mockAction";
import { IMockTrigger } from "./mockTrigger";

export interface IMockResponse {
    triggers: IMockTrigger[];
    actions: IMockAction[]
}