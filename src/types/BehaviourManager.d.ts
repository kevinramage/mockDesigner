export class BehaviourManager {
    getBehaviours(name: string) : Promise<string[]>;
    getBehaviour(name: string, code: string) : Promise<string>;
    createBehaviour(name: string, code: string) : Promise<string>;
    deleteBehaviour(name: string, code: string) : Promise<boolean>;

    static instance : BehaviourManager;
}