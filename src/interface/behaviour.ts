import { IAction } from "./action";
import { ICondition } from "./condition";

export interface IBehaviour {
    name: string;
    conditions: ICondition[];
    actions: IAction[];
}