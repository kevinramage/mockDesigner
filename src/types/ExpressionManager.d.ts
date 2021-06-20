import { Condition } from "./Condition";
import { Context } from "./Context";

export class ExpressionManager {
    evaluateExpression(context: Context, expression: string) : string;
    evaluateCondition(context: Context, condition: Condition) : boolean;

    static instance : ExpressionManager;
}