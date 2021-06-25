import { Condition } from "./Condition";
import { Context } from "./Context";

export class ExpressionManager {
    evaluateExpression(context: Context, expression: string) : string;
    evaluateCondition(context: Context, condition: Condition) : boolean;

    evaluateVariableExpression(variableName: string, context: Context) : string;
    evaluateDataSource(dataSource: string, expression: string, context: Context) : string;
    evaluateFunction(functionName: string, expressions: string[], context: Context): Promise<string>;

    expressionToString(value: any) : string;

    static instance : ExpressionManager;
}