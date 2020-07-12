import { IAction } from "./action";

export interface ITrigger {
    type: string;
}

export interface INoTrigger extends ITrigger {
    actions: IAction[];
}

export interface IDataTrigger extends ITrigger {
    conditions: string[];
    actions: IAction[];
}

export interface IValidateTrigger extends ITrigger {
    mandatoriesFields: string[];
    actions: IAction[];
}

export interface IRandomTrigger extends ITrigger {
    messages: IRandomMessageTrigger[];
}

export interface IRandomMessageTrigger {
    probability: number;
    actions: IAction[];
}

export interface ISequentialTrigger extends ITrigger {
    messages: ISequentialMessage[];
}

export interface ISequentialMessage {
    repeat: number;
    actions: IAction[];
}