import { IAction } from "../action";

export interface IRandomTrigger {
    type: "RANDOM" | "random";
    messages: IMessageRandomTrigger[];
    actions: IAction[];
}

export interface IMessageRandomTrigger {
    probability: number;
    actions: IAction[];
}