import { Context } from "./Context";

export class Condition {

    check(context: Context) : boolean;

    left : string;
    right: string;
    operation : string;
}