import { IOperation } from "./operation";

export interface IPathItem {
    $ref ?: string;
    summary ?: string;
    description ?: string;
    get ?: IOperation;
    post ?: IOperation;
    put ?: IOperation;
    delete ?: IOperation;
    options ?: IOperation;
    head ?: IOperation;
    patch ?: IOperation;
    trace ?: IOperation;
    servers ?: any[];
    parameters ?: any[];

}