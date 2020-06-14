import { IMockTrigger } from "./mockTrigger";
import { IMockAction } from "./mockAction";

export interface IMockDataTriger extends IMockTrigger {
    type: "data";
    conditions: string[];
}