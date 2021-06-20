import { Condition } from "../business/core/condition";
import { ICondition } from "../interface/condition";

export class ConditionFactory {
    public static build(data: ICondition, workspace: string) {
        const condition = new Condition();
        if (data.leftOperand) { condition.left = data.leftOperand; }
        if (data.rightOperand) { condition.right = data.rightOperand; }
        if (data.operation) { condition.operation = data.operation; }
        return condition;
    }
}