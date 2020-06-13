import { IMockTrigger } from "./mockTrigger";

export interface IMockValidationTrigger extends IMockTrigger {
    type: "validate",
    mandatoriesFields: string[]
}