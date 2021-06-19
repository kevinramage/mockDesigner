import { ClientOpts, createClient, RedisClient } from "redis";

export class RedisManager {

    private static _instance : RedisManager;
    private _client ?: RedisClient;

    constructor() {
        this.init();
    }

    public init() {
        const options : ClientOpts = {};
        this._client = createClient(options);
    }

    public getValue(key: string) {
        return new Promise<string|null>((resolve, reject) => {
            this.client.get(key, (err, reply) => {
                if (!err) {
                    resolve(reply);
                } else {
                    reject(err);
                }
            });
        });
    }

    public setValue(key: string, value: string) {
        return new Promise<void>((resolve, reject) => {
            this.client.set(key, value, (err) => {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    }

    public increment(key: string) {
        return new Promise<number>(async (resolve) => {
            const value = await RedisManager.instance.getValue(key) || "";
            let increment = 1;
            if (!isNaN(Number.parseInt(value))) {
                increment = Number.parseInt(value);
            }
            await RedisManager.instance.setValue(key, (increment+1).toString());
            resolve(increment);
        });
    }

    private get client() {
        return this._client as RedisClient;
    }

    public static get instance() {
        if (!this._instance) {
            this._instance = new RedisManager();
        }
        return RedisManager._instance;
    }
}