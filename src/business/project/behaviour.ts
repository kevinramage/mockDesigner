import { BehaviourManager } from "../core/behaviourManager";
import { Condition } from "../core/condition";
import { Context } from "../core/context";
import { ExpressionManager } from "../core/expressionManager";
import { Action } from "./action";
import * as winston from "winston";

export class Behaviour {
    private _name: string;
    private _conditions: Condition[];
    private _actions : Action[];

    constructor() {
        this._name = "";
        this._conditions = [];
        this._actions = [];
    }

    public check(context: Context, serviceName: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const behaviour = await BehaviourManager.instance.getBehaviour(serviceName, this.name);
                if (behaviour) {
                    const result = await this.evaluateConditions(context);
                    resolve(result);
                } else {
                    resolve(false);
                }
            } catch (err) {
                reject(err);
            } 
        });
    }

    private evaluateConditions(context: Context){
        return new Promise<boolean>((resolve, reject) => {
            try {
                let result = true;
                this.conditions.forEach(c => {
                    const res = ExpressionManager.instance.evaluateCondition(context, c);
                    if (!res) {
                        result = false;
                    }
                });
                resolve(result);

            } catch (err) {
                reject(err);
            }
        });
    }

    public execute(context: Context) {
        winston.debug("Behaviour.execute - Execute behaviour: " + this.name);
        for (var index in this.actions) {
            this.actions[index].execute(context);
        }
    }

    public addCondition(condition: Condition) {
        this._conditions.push(condition);
    }

    public addAction(action: Action) {
        this._actions.push(action);
    }

    public toObject() {
        return {
            name: this.name,
            conditions: this.conditions.map(c => { return c.toObject() }),
            actions: this.actions.map(a => { return a.toObject() })
        }
    }

    public get name() {
        return this._name;
    }
    public set name(value) {
        this._name = value;
    }

    public get conditions() {
        return this._conditions;
    }

    public get actions() {
        return this._actions;
    }
}