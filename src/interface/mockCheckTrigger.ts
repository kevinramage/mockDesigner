import { IMockTrigger } from "./mockTrigger";

export interface IMockCheckTrigger extends IMockTrigger {
    mandatories: string[];
}