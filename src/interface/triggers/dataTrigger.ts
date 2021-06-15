import { IAction } from "../action";

export interface IDataTrigger {
    type: "DATA" | "data" 
    conditions: IDataTriggerCondition[];
    actions: IAction[];
}

export interface IDataTriggerCondition {
    leftOperand: string;
    rightOperand: string;
    operation: string;
}