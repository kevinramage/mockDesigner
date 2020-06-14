import { IMockAuthentication } from "./mockAuthentication";

export interface IMockBasicAuthentication extends IMockAuthentication {
    type: "BASIC"
    userName: string
    password: string
}