import { IDataTrigger } from "./triggers/dataTrigger";
import { INoTrigger } from "./triggers/noTrigger";

export type ITrigger = INoTrigger | IDataTrigger;