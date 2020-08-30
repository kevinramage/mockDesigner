import { IMockAuthentication } from "./mockAuthentication";
import { IMockResponse } from "./mockResponse";
import { IMockServiceRequestStorage } from "./mockServiceRequestStorage";

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
    requestStorage ?: IMockServiceRequestStorage;
}