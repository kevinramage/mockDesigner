import { IMockTrigger } from "./mockTrigger";
import { IMockValidationEnum } from "./mockValidationEnum";

export interface IMockValidationTrigger extends IMockTrigger {
    type: "validate";
    mandatoriesFields: string[];
    enumFields: IMockValidationEnum[];
}