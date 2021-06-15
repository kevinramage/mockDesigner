import { IDataTrigger } from "./triggers/dataTrigger";
import { INoTrigger } from "./triggers/noTrigger";
import { ISequentialTrigger } from "./triggers/sequentialTrigger";

export type ITrigger = INoTrigger | IDataTrigger | ISequentialTrigger;