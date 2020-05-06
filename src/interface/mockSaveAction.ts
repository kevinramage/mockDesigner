import { IMockAction } from "./mockAction";
import { IKeyValue } from "./keyValue";

export interface IMockSaveAction extends IMockAction {
    type: "save",
    expressions: IKeyValue[],
    storage: string,
    keys: string[]
}