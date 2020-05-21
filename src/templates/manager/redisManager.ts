import * as winston from "winston";
import * as redis from "redis";
import * as util from "util";

export class RedisManager {
    private static _instance : RedisManager;
    private _client : redis.RedisClient | undefined;

    public init() {
        const options : redis.ClientOpts = {};
        if ( process.env.REDIS_URL ) {
            options.host = process.env.REDIS_URL;
        }
        this._client = redis.createClient(options);
    }

    public getValue(key: string) {
        return new Promise<string>((resolve, reject) => {
            if ( this._client ) {
                this._client.get(key, (err, value) => {
                    if ( !err ) {
                        resolve(value);
                    } else {
                        reject(err);
                    }
                });
            } else {
                reject("Redis client null or undefined");
            }
        });
    }

    public setValue(key: string, value: string) {
        winston.debug("RedisManager.setValue");
        return new Promise<void>((resolve, reject) => {
            if ( this._client ) {
                this._client.set(key, value, (err, reply) => {
                    if ( !err ) {
                        resolve();
                    } else {
                        winston.error("RedisManager.setValue: Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                winston.error("RedisManager.setValue: Redis client null or undefined");
                reject("Redis client null or undefined");
            }
        });
    }

    public setExValue(key: string, seconds: number, value: string) {
        winston.debug("RedisManager.setExValue");
        return new Promise<void>((resolve, reject) => {
            if ( this._client ) {
                this._client.setex(key, seconds, value, (err, reply) => {
                    if ( !err ) {
                        resolve();
                    } else {
                        winston.error("RedisManager.setExValue: Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                winston.error("RedisManager.setExValue: Redis client null or undefined");
                reject("Redis client null or undefined");
            }
        });
    }

    public saveObject(key: string, fieldIdName: string, fieldIdValue: string, body: object) {
        return new Promise<void>((resolve, reject) => {
            if ( this._client ) {
                const saveKey = util.format("_obj_%s_%s", key, fieldIdValue);
                const data = { fieldName: fieldIdName, fieldValue: fieldIdValue, body };
                this._client.set(saveKey, JSON.stringify(data), (err, reply) => {
                    if ( !err ) {
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            } else {
                reject("Redis client null or undefined");
            }
        });
    }

    public static get instance() {
        if ( !RedisManager._instance ) {
            RedisManager._instance = new RedisManager();
        }
        return RedisManager._instance;
    }
}