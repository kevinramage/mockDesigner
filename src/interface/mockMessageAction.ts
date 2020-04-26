import { IMockAction } from "./mockAction";

export interface IMockMessageAction extends IMockAction {
    type: "message"
    status: number
    headers: {}
    bodyFile: string
    body: string
}