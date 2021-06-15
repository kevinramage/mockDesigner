import { IService } from "./service";

export interface IProject {
    name : string;
    services : IService[];
}