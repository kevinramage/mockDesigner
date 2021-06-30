import { TRIGGERS } from "../business/utils/enum";
import { Trigger } from "../business/project/trigger";
import { ITrigger } from "../interface/trigger";
import { ActionFactory } from "./action";
import { IDataTrigger } from "../interface/triggers/dataTrigger";
import { DataTrigger } from "../business/project/trigger/data";
import { ISequentialTrigger } from "../interface/triggers/sequentialTrigger";
import { SequentialMessageTrigger, SequentialTrigger } from "../business/project/trigger/sequential";
import { ConditionFactory } from "./conditionFactory";
import { IRandomTrigger } from "../interface/triggers/randomTrigger";
import { RandomMessageTrigger, RandomTrigger } from "../business/project/trigger/random";

export class TriggerFactory {
    
    public static build(triggerData : ITrigger, workspace: string) : Trigger | null {
        if (triggerData.type.toUpperCase() === TRIGGERS.NONE) {
            return TriggerFactory.buildNoTrigger(triggerData, workspace);
        } else if (triggerData.type.toUpperCase() === TRIGGERS.DATA) {
            return TriggerFactory.buildDataTrigger(triggerData as IDataTrigger, workspace);
        } else if (triggerData.type.toUpperCase() === TRIGGERS.SEQUENTIAL) {
            return TriggerFactory.buildSequentialTrigger(triggerData as ISequentialTrigger, workspace);
        } else if (triggerData.type.toUpperCase() === TRIGGERS.RANDOM) {
            return TriggerFactory.buildRandomTrigger(triggerData as IRandomTrigger, workspace);
        } else {
            return null;
        }
    }

    private static buildNoTrigger(triggerData : ITrigger, workspace: string) {
        const trigger = new Trigger();
        if (triggerData.actions) {
            triggerData.actions.forEach(actionData => {
                const action = ActionFactory.build(actionData, workspace);
                if (action) {
                    trigger.addAction(action);
                }
            });
        }
        return trigger;
    }

    private static buildDataTrigger(triggerData : IDataTrigger, workspace: string) {
        const trigger = new DataTrigger();
        if (triggerData.conditions) {
            triggerData.conditions.forEach(c => {
                const condition = ConditionFactory.build(c, workspace);
                trigger.addCondition(condition);
            });
        }
        if (triggerData.actions) {
            triggerData.actions.forEach(actionData => {
                const action = ActionFactory.build(actionData, workspace);
                if (action) {
                    trigger.addAction(action);
                }
            });
        }
        return trigger;
    }

    private static buildSequentialTrigger(triggerData : ISequentialTrigger, workspace: string) {
        const trigger = new SequentialTrigger();
        if (triggerData.messages) {
            triggerData.messages.forEach(m => {
                const message = new SequentialMessageTrigger();
                if (m.repeat) { message.repeat = m.repeat; }
                if (m.actions) {
                    m.actions.forEach(a => {
                        const action = ActionFactory.build(a, workspace);
                        if (action != null) {
                            message.addAction(action);
                        }
                    });
                }
                trigger.addMessage(message);
            });
        }
        if (triggerData.actions) {
            triggerData.actions.forEach(actionData => {
                const action = ActionFactory.build(actionData, workspace);
                if (action) {
                    trigger.addAction(action);
                }
            });
        }
        return trigger;
    }

    private static buildRandomTrigger(randomData : IRandomTrigger, workspace: string) {
        const trigger = new RandomTrigger();
        if (randomData.messages) {
            randomData.messages.forEach(m => {
                const message = new RandomMessageTrigger();
                if (m.probability) { message.probability = m.probability; }
                if (m.actions) {
                    m.actions.forEach(a => {
                        const action = ActionFactory.build(a, workspace);
                        if (action != null) {
                            message.addAction(action);
                        }
                    });
                }
                trigger.addMessage(message);
            });
        }
        return trigger;
    }
}