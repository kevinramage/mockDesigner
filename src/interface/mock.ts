import { IMockService } from "./mockService";
import { IMockAction } from "./mockAction";

export interface IMock  {
    name: string
    default: IMockAction[]
    services: IMockService[]
}