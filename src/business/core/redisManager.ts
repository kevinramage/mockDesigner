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

    public setValueEx(key: string, value: string, seconds: number) {
        return new Promise<void>((resolve, reject) => {
            this.client.setex(key, seconds, value, (err) => {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    }

    public delete(key: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.client.del(key, (err, reply) => {
                if (!err) {
                    resolve((reply === 1));
                } else {
                    reject(err);
                }
            });
        });
    }

    public increment(key: string) {
        return new Promise<number>(async (resolve, reject) => {
            this.client.incr(key, (err, reply) => {
                if (!err) {
                    resolve(reply);
                } else {
                    reject(err);
                }
            });
        });
    }

    public sadd(key: string, value: string) {
        return new Promise<number>(async (resolve, reject) => {
            this.client.sadd(key, value, (err, reply) => {
                if (!err) {
                    resolve(reply);
                } else {
                    reject(err);
                }
            });
        });
    }

    public smember(key: string, member: string) {
        return new Promise<string|null>(async (resolve, reject) => {
            this.client.smembers(key, (err, reply) => {
                if (!err) {
                    const result = reply.find(r => { return r == member; }) || null;
                    resolve(result);
                } else {
                    reject(err);
                }
            });
        });
    }

    public smembers(key: string) {
        return new Promise<string[]>(async (resolve, reject) => {
            this.client.smembers(key, (err, reply) => {
                if (!err) {
                    resolve(reply);
                } else {
                    reject(err);
                }
            });
        });
    }

    public srem(key: string, member: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            this.client.srem(key, member, (err, reply) => {
                if (!err) {
                    resolve((reply == 1));
                } else {
                    reject(err);
                }
            });
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