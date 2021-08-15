import { Service } from "./service";
import { TRIGGERS } from "../utils/enum";
import { DataTrigger } from "./trigger/data";
import { RandomTrigger } from "./trigger/random";
import { SequentialTrigger } from "./trigger/sequential";
import { Trigger } from "./trigger";
import { Project } from "./project";

/**
 * Class to manage trigger operations
 * Impossible to add these method in trigger class because this implementation trigger a compilation issue due to a call to an extended class
 */
export class TriggerOperation {

    public static createTrigger(project: Project, service: Service, type: string) {
        return new Promise<Trigger>(async(resolve, reject) => {
            const triggers = [TRIGGERS.DATA, TRIGGERS.RANDOM, TRIGGERS.SEQUENTIAL, TRIGGERS.NONE];
            if (type && triggers.includes(type.toUpperCase())) {
                
                // Create trigger
                let trigger = new Trigger();
                switch (type.toUpperCase()) {
                    case TRIGGERS.DATA:
                        trigger = new DataTrigger();
                    break;
                    case TRIGGERS.RANDOM:
                        trigger = new RandomTrigger();
                    break;
                    case TRIGGERS.SEQUENTIAL:
                        trigger = new SequentialTrigger();
                    break;
                }

                // Add trigger
                service.response.addTrigger(trigger);

                // Save code
                try {
                    await project.save();
                } catch (err) {
                    reject(err);
                }

                resolve(trigger);

            } else {
                reject(new Error("Invalid trigger type"));
            }
        });
    }

    public static deleteTrigger(project:Project, service: Service, index: number) {
        return new Promise<void>(async (resolve, reject) => {
            if (index >= 0 && index < service.response.triggers.length) {

                // Remove trigger
                service.response.removeTrigger(index);

                // Save code
                try {
                    await project.save();
                    resolve();
                    
                } catch (err) {
                    reject(err);
                }

            } else {
                throw new Error("Invalid trigger number");
            }
        });
    }
}