import { IMockAction } from "./mockAction";

export interface IMockMicroServiceAction extends IMockAction {
    type: "message"
    action: string
    storage: IMicroServiceStorage
    data: string
    expiration: number
}

export interface IMicroServiceStorage {
    businessObject: string;
    propertyName: string;
    propertyValue: string;
    parent ?: IMicroServiceStorageParent;
}

export interface IMicroServiceStorageParent {
    businessObject: string;
    propertyValue: string;
    parent ?: IMicroServiceStorageParent;
}