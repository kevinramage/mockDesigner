// Based on OpenAPI 3.0 https://swagger.io/specification/

import { IPathItem } from "./pathItem";

export interface ISwagger {
    openapi : string;
    info : any;
    servers : any[];
    paths : {[id: string] : IPathItem};
    components : any;
    security : any[];
    tags : any[];
    externalDocs : any;
}