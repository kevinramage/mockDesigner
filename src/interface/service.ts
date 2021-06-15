import { IAuthentication } from "./authentication";
import { IResponse } from "./response";

export interface IService { 
    name : string;
    method: string;
    path: string;
    response: IResponse;
    authentication: IAuthentication;
}