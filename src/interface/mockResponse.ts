import { IMockAction } from "./mockAction";

export interface IMockResponse {
    trigger: string
    actions: IMockAction[]
}