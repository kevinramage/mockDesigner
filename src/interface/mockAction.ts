import { IMockDelayAction } from "./mockDelayAction";
import { IMockMessageAction } from "./mockMessageAction";
import { IMockValidationAction } from "./mockValidationAction";
import { IMockPersistAction } from "./mockPersistAction";

export type IMockAction = IMockDelayAction | IMockMessageAction | IMockValidationAction | IMockPersistAction