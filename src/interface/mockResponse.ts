import { IMockTrigger } from "./mockTrigger";
import { IMockBehaviour } from "./mockBehaviour";

export interface IMockResponse {
    behaviours: IMockBehaviour[];
    triggers: IMockTrigger[];
}