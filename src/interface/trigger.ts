import { IDataTrigger } from "./triggers/dataTrigger";
import { INoTrigger } from "./triggers/noTrigger";
import { IRandomTrigger } from "./triggers/randomTrigger";
import { ISequentialTrigger } from "./triggers/sequentialTrigger";

export type ITrigger = INoTrigger | IDataTrigger | ISequentialTrigger | IRandomTrigger;