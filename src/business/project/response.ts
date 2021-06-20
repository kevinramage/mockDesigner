import { Context } from "../../business/core/context";
import { Behaviour } from "./behaviour";
import { Trigger } from "./trigger";

export class Response {
    private _triggers : Array<Trigger>;
    private _behaviours : Array<Behaviour>;

    constructor() {
        this._triggers = [];
        this._behaviours = [];
    }

    public addTrigger(trigger: Trigger) {
        this._triggers.push(trigger);
    }

    public addBehaviour(behaviour: Behaviour) {
        this._behaviours.push(behaviour);
    }

    public execute(context: Context, serviceName: string) {
        return new Promise<void>(async resolve => {
            let behaviourFound = false;

            // Run behaviours
            for (var index in this.behaviours) {
                const behaviour = this.behaviours[index];
                const result = await behaviour.check(context, serviceName);
                if (result) {
                    behaviourFound = true;
                    behaviour.execute(context);
                }
            }
    
            // Run triggers
            if (!behaviourFound) {
                for (var index in this.triggers ) {
                    const trigger = this.triggers[index];
                    if (trigger.check(context)) {
                        await trigger.execute(context);
                    }
                }
            }

            resolve();
        });
    }

    public get triggers() {
        return this._triggers;
    }

    public get behaviours() {
        return this._behaviours;
    }
}