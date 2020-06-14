import { IMockTrigger } from "./mockTrigger";
import { IMockAction } from "./mockAction";

export interface IMockValidationTrigger extends IMockTrigger {
    type: "validate";
    mandatoriesFields: string[];
}