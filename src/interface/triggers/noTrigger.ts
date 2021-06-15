import { IAction } from "../action";

export interface INoTrigger {
    type: "NONE" | "none";
    actions: IAction[];
}