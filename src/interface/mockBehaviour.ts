import { IMockAction } from "./mockAction";

export interface IMockBehaviour {
    name: string;
    repeat?: number;
    conditions ?: string[];
    actions: IMockAction[];
}