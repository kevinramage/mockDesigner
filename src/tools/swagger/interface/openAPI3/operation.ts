import { IResponse } from "./response";

export interface IOperation {
    tags : string[];
    summary : string;
    description : string;
    externalDocs : any;
    operationId : string;
    parameters : [any];
    requestBody : any;
    responses : {[id: string] : IResponse};
    callbacks : any;
    deprecated : any;
    security : [ any ];
    servers : [ any ];
}