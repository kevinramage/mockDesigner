import { Behaviour } from "../business/project/behaviour";
import { IBehaviour } from "../interface/behaviour";
import { ActionFactory } from "./action";
import { ConditionFactory } from "./conditionFactory";

export class BehaviourFactory {

    public static build(data: IBehaviour, workspace: string) {
        const behaviour = new Behaviour();
        if (data.name) { behaviour.name = data.name; }
        if (data.conditions) {
            data.conditions.forEach(c => {
                const condition = ConditionFactory.build(c, workspace);
                behaviour.addCondition(condition);
            });
        }
        if (data.actions) {
            data.actions.forEach(a => {
                const action = ActionFactory.build(a, workspace);
                if (action != null) {
                    behaviour.addAction(action);
                }
            });
        }
        return behaviour;
    }
}