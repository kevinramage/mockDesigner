import { ActionFactory } from "../../factory/action";
import { IAction } from "../../interface/action";
import { join } from "path";
import { Action } from "./action";
import { Project } from "./project";
import { Trigger } from "./trigger";
import { OptionsManager } from "../core/optionsManager";

export class ActionOperation {
    
    public static createAction(project: Project, trigger: Trigger, data: IAction) {
        return new Promise<Action>(async (resolve, reject) => {

            // Create action
            const mockDirectory = OptionsManager.instance.mockWorkingDirectory;
            const workspace = join(mockDirectory, project.name);
            const action = ActionFactory.build(data, workspace);

            if (action) {

                // Add action
                trigger.addAction(action);

                // Save code
                try {
                    await project.save();
                    resolve(action);

                } catch (err) {
                    reject(err);
                }

            } else {
                reject(new Error("Invalid action type"));
            }

        });
    }

    public static deleteAction(project: Project, trigger: Trigger, index: number) {
        return new Promise<void>(async (resolve, reject) => {
            if (index >= 0 && index < trigger.actions.length) {

                // Remove action
                trigger.actions.splice(index, 1);

                // Save project
                try {
                    await project.save();
                    resolve();

                } catch (err) {
                    reject(err);
                }

            } else {
                reject(new Error("Invalid trigger identifier"));
            }
        });
    }
}