import { IMockAction } from "./mockAction";

export interface IMockMicroServiceAction extends IMockAction {
    type: "message"
    action: string
    storage: string
    identifier: {
        name: string,
        value: string
    }
}