import { IMockBehaviour } from "interface/mockBehaviour";
import { Behaviour } from "../business/behaviour";
import { ActionFactory } from "./actionFactory";

export class BehaviourFactory {

    public static build(behaviourData: IMockBehaviour) {
        const behaviour = new Behaviour();

        // Name
        behaviour.name = behaviourData.name;

        // Repeat
        if ( behaviourData.repeat ) {
            behaviour.repeat = behaviourData.repeat;
        }

        // Conditions
        if ( behaviourData.conditions ) {
            behaviourData.conditions.forEach(condition => {
                behaviour.addCondition(condition);
            });
        }

        // Actions
        behaviourData.actions.forEach(action => {
            const actionBuilt = ActionFactory.build(action);
            if ( actionBuilt ) {
                behaviour.addAction(actionBuilt);
            }
        });

        return behaviour;
    }
}