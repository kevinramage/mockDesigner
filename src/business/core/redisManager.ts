import { ClientOpts, createClient, RedisClient, RetryStrategy } from "redis";
import * as winston from "winston";

export class RedisManager {

    private static _instance : RedisManager;
    private _client ?: RedisClient;
    private _ready : boolean;

    constructor() {
        this._ready = false;
        this.init();
    }

    public init() {
        const options : ClientOpts = {};
        if ( process.env.REDIS_URL ) {
            options.host = process.env.REDIS_URL;
        }
        this._client = createClient(options);

        // Ready
        this.client.on("ready", () => {
            this._ready = true;
        });

        // Avoid connection error log in loop
        this.client.on("error", (err) => { });
    }

    public getValue(key: string) {
        return new Promise<string|null>((resolve, reject) => {
            if (this.isReady) {
                this.client.get(key, (err, reply) => {
                    if (!err) {
                        resolve(reply);
                    } else {
                        winston.error("RedisManager.getValue - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            }
        });
    }

    public setValue(key: string, value: string) {
        return new Promise<void>((resolve, reject) => {
            if (this.isReady) {
                this.client.set(key, value, (err) => {
                    if (!err) {
                        resolve();
                    } else {
                        winston.error("RedisManager.setValue - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            }
        });
    }

    public setValueEx(key: string, value: string, seconds: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.isReady) {
                this.client.setex(key, seconds, value, (err) => {
                    if (!err) {
                        resolve();
                    } else {
                        winston.error("RedisManager.setValueEx - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            } 
        });
    }

    public delete(key: string) {
        return new Promise<boolean>((resolve, reject) => {
            if (this.isReady) {
                this.client.del(key, (err, reply) => {
                    if (!err) {
                        resolve((reply === 1));
                    } else {
                        winston.error("RedisManager.delete - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            } 
        });
    }

    public increment(key: string) {
        return new Promise<number>(async (resolve, reject) => {
            if (this.isReady) {
                this.client.incr(key, (err, reply) => {
                    if (!err) {
                        resolve(reply);
                    } else {
                        winston.error("RedisManager.increment - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            }
        });
    }

    public sadd(key: string, value: string) {
        return new Promise<number>(async (resolve, reject) => {
            if (this.isReady) {
                this.client.sadd(key, value, (err, reply) => {
                    if (!err) {
                        resolve(reply);
                    } else {
                        winston.error("RedisManager.sadd - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            } 
        });
    }

    public smember(key: string, member: string) {
        return new Promise<string|null>(async (resolve, reject) => {
            if (this.isReady) {
                this.client.smembers(key, (err, reply) => {
                    if (!err) {
                        const result = reply.find(r => { return r == member; }) || null;
                        resolve(result);
                    } else {
                        winston.error("RedisManager.smember - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            }
        });
    }

    public smembers(key: string) {
        return new Promise<string[]>(async (resolve, reject) => {
            if (this.isReady) {
                this.client.smembers(key, (err, reply) => {
                    if (!err) {
                        resolve(reply);
                    } else {
                        winston.error("RedisManager.smembers - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            } 
        });
    }

    public srem(key: string, member: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            if (this.isReady) {
                this.client.srem(key, member, (err, reply) => {
                    if (!err) {
                        resolve((reply == 1));
                    } else {
                        winston.error("RedisManager.srem - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            }
        });
    }

    public hget(key: string, member: string) {
        return new Promise<string>(async (resolve, reject) => {
            if (this.isReady) {
                this.client.hget(key, member, (err, reply) => {
                    if (!err) {
                        resolve(reply);
                    } else {
                        winston.error("RedisManager.hget - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            }
        });
    }

    public hset(key: string, member: string, value: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            if (this.isReady) {
                this.client.hset(key, member, value, (err, reply) => {
                    if (!err) {
                        resolve(reply == 1);
                    } else {
                        winston.error("RedisManager.hset - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            }
        });
    }

    public hdel(key: string, member: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            if (this.isReady) {
                this.client.hdel(key, member, (err, reply) => {
                    if (!err) {
                        resolve(reply == 1);
                    } else {
                        winston.error("RedisManager.hdel - Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                reject(new Error("Redis client not connected"));
            } 
        });
    }

    private get client() {
        return this._client as RedisClient;
    }

    private get isReady() {
        return this._ready;
    }

    public static get instance() {
        if (!this._instance) {
            this._instance = new RedisManager();
        }
        return RedisManager._instance;
    }
}