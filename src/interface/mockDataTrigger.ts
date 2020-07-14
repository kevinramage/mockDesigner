import { IMockTrigger } from "./mockTrigger";
import { IMockDataTriggerCondition } from "./mockDataTriggerCondition";

export interface IMockDataTrigger extends IMockTrigger {
    type: "data";
    conditions: IMockDataTriggerCondition[];
}