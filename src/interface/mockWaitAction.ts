import { IMockAction } from "./mockAction";

export interface IMockWaitAction extends IMockAction {
    type: "timeout",
    time: number
}