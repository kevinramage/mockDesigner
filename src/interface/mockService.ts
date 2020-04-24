import { IMockAuthentication } from "./mockAuthentication";
import { IMockResponse } from "./mockResponse";

export interface IMockService {
    name : string
    method ?: string
    path : string
    authentication ?: IMockAuthentication
    data ?: object
    response : IMockResponse;
}