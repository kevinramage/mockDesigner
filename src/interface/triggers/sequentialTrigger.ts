import { IAction } from "../action";

export interface ISequentialTrigger {
    type: "SEQUENTIAL" | "sequential";
    messages: ISequentialMessageTrigger[];
    actions: IAction[]; // Add for compatibility with others interfaces, not use
}

export interface ISequentialMessageTrigger {
    repeat: number;
    actions: IAction[];
}