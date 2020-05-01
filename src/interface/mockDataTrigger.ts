import { IMockTrigger } from "./mockTrigger";

export interface IMockDataTriger extends IMockTrigger {
    type: "data";
    xpath: string;
    json: string;
}