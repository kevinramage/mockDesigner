import { IBehaviour } from "./behaviour";
import { ITrigger } from "./trigger";

export interface IResponse {
    triggers : ITrigger[];
    behaviours : IBehaviour[];
}