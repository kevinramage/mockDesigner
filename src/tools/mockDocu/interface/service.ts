import { ITrigger } from "./trigger";

export interface IService {
    name : string;
    method : string;
    path : string;
    response: {
        triggers: ITrigger[]
    }
}