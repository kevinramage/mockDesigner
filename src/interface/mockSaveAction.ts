import { IMockAction } from "./mockAction";

export interface IMockSaveAction extends IMockAction {
    key: string;
    source: {
        type: string,
        fieldName: string
    };
}