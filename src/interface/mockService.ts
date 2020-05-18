import { IMockAuthentication } from "./mockAuthentication";
import { IMockResponse } from "./mockResponse";

export interface IMockService {
    name : string;
    method ?: string;
    pingPath ?: string;
    path : string;
    soapAction ?: string;
    delay ?: number;
    authentication ?: IMockAuthentication;
    data ?: object;
    response : IMockResponse;
}