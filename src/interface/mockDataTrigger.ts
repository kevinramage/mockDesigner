import { IMockTrigger } from "./mockTrigger";

export interface IMockDataTriger extends IMockTrigger {
    type: "data";
    conditions: string[]
}