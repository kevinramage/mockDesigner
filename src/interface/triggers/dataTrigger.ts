import { IAction } from "../action";
import { ICondition } from "../condition";

export interface IDataTrigger {
    type: "DATA" | "data" 
    conditions: ICondition[];
    actions: IAction[];
}