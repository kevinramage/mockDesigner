import { Context } from "../../core/context";
import { Action } from "../action";
import { Trigger } from "../trigger";

export class SequentialTrigger extends Trigger {

    private _messages : SequentialMessageTrigger[];
    private _count : number;
    
    constructor() {
        super();
        this._messages = [];
        this._count = 0;
    }

    public execute(context: Context) {
        let current = 0;
        console.info("before: " + this.count);
        for (var key in this.messages) {
            const message = this.messages[key];
            if (this.count >= current && this.count < current + message.repeat) {
                message.execute(context);
                this.count = (this.count + 1) % this.max;
                console.info("count: " + this.count);
                break;
            }
            current += message.repeat;
        }
    }

    public addMessage(message: SequentialMessageTrigger) {
        this._messages.push(message);
    }

    public get messages(){
        return this._messages;
    }
    public get count(){
        return this._count;
    }
    public set count(value){
        this._count = value;
    }
    public get max() {
        return this.messages.map(m => { return m.repeat; }).reduce((a, b) => { return a + b; });
    }
}

export class SequentialMessageTrigger {
    private _repeat : number;
    private _actions : Action[];

    constructor() {
        this._repeat = 1;
        this._actions = [];
    }

    public execute(context: Context) {
        this._actions.forEach(a => { a.execute(context); });
    }

    public addAction(action: Action) {
        this._actions.push(action);
    }

    public get repeat(){
        return this._repeat;
    }
    public set repeat(value) {
        this._repeat = value;
    }

    public get actions(){
        return this._actions;
    }
}