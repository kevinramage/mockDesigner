
import { Context } from "../../core/context";
import { Action } from "../action";
import { Trigger } from "../trigger";

export class RandomTrigger extends Trigger {
    private _messages : RandomMessageTrigger[];

    constructor() {
        super();
        this._messages = [];
    }

    public addMessage(message: RandomMessageTrigger) {
        this._messages.push(message);
    }

    public execute(context: Context) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                let score = Math.trunc(Math.random() * (this.maxProbability - 1));
                if (score < 0) { score = 0; }
                const message = this.getMessage(score);
                if (message) {
                    await message.execute(context);
                    resolve();
                } else {
                    reject(new Error("No message found"));
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    public getMessage(index: number) {
        let message : RandomMessageTrigger | null = null;
        let currentValue = 0;
        for (var i = 0; i < this.messages.length; i++) {
            if (index >= currentValue && index <= currentValue + this.messages[i].probability) {
                message = this.messages[i];
                break;
            }
            currentValue += this.messages[i].probability;
        }
        return message;
    }

    public get messages() {
        return this._messages;
    }

    public get maxProbability() {
        return this._messages.map(m => { return m.probability}).reduce((a, b) => { return a + b});
    }
}

export class RandomMessageTrigger {
    private _probability : number;
    private _actions : Action[];

    constructor() {
        this._probability = 0;
        this._actions = [];
    }

    public execute(context: Context) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                for (var i = 0; i < this.actions.length; i++) {
                    await this.actions[i].execute(context);
                }
                resolve();

            } catch (err) {
                reject(err);
            }
        });
    }

    public addAction(action: Action) {
        this._actions.push(action);
    }

    public get probability() {
        return this._probability;
    }

    public set probability(value) {
        this._probability = value;
    }

    public get actions() {
        return this._actions;
    }
}