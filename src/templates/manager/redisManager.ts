import * as winston from "winston";
import * as redis from "redis";
import * as util from "util";

export class RedisManager {
    private static _instance : RedisManager;
    private _client : redis.RedisClient | undefined;

    public init() {
        winston.debug("RedisManager.init");
        const options : redis.ClientOpts = {};
        if ( process.env.REDIS_URL ) {
            options.host = process.env.REDIS_URL;
        }
        this._client = redis.createClient(options);
    }

    public getValue(key: string) {
        winston.debug("RedisManager.getValue: " + key);
        return new Promise<string>((resolve, reject) => {
            if ( this._client ) {
                this._client.get(key, (err, value) => {
                    if ( !err ) {
                        resolve(value);
                    } else {
                        winston.error("RedisManager.getValue -Internal error: " + err);
                        reject(err);
                    }
                });
            } else {
                reject("Redis client null or undefined");
            }
        });
    }

    public setValue(key: string, value: string) {
        winston.debug(util.format("RedisManager.setValue: %s = %s", key, value));
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
        winston.debug(util.format("RedisManager.setExValue: %s (%d) = %s", key, seconds, value));
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

    public deleteValue(key: string) {
        winston.debug("RedisManager.deleteValue: " + key);
        return new Promise<void>((resolve, reject) => {
            if ( this._client ) {
                this._client.del(key, (err, reply) => {
                    if ( !err ) {
                        resolve();
                    } else {
                        winston.error("RedisManager.deleteValue: Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                winston.error("RedisManager.deleteValue: Redis client null or undefined");
                reject("Redis client null or undefined");
            }
        });
    }

    public async addIndex(key: string, value: string) {
        winston.debug(util.format("RedisManager.addIndex: %s = %s", key, value));
        var data : string[];

        // Get indexes
        try {
            data = JSON.parse(await RedisManager.instance.getValue(key));
            if ( !data ) {
                data = [];
            }
        } catch (ex) {
            data = [];
        }

        // Add value
        data.push(value);

        // Save value
        await RedisManager.instance.setValue(key, JSON.stringify(data));
    }

    public async removeIndex(key: string, value: string) {
        winston.debug(util.format("RedisManager.removeIndex: %s[%s]", key, value));
        var data : string[];

        // Get indexes
        try {
            data = JSON.parse(await RedisManager.instance.getValue(key));
            if ( !data ) {
                data = [];
            }
        } catch (ex) {
            data = [];
        }

        // Add value
        data = data.filter((valueToAnalyze) => { return valueToAnalyze != value; })

        // Save value
        await RedisManager.instance.setValue(key, JSON.stringify(data));
    }

    public async getAllObject(key: string) {
        winston.debug("RedisManager.getAllObject: " + key);

        // Get indexes
        try {

            // Read index
            const data : string[] = JSON.parse(await RedisManager.instance.getValue(key));

            // Read each element present in index
            const objects : any[] = [];
            const promises = data.map(index => {
                return new Promise(async(resolve) => {
                    const text = await RedisManager.instance.getValue(index);
                    if ( text ) {
                        objects.push(JSON.parse(text));
                    }
                    resolve();
                })
            });
            await Promise.all(promises);
            return objects.slice(0, 50);

        } catch ( ex ) {
            return [];
        }
    }

    public saveObject(key: string, fieldIdName: string, fieldIdValue: string, body: object) {
        winston.debug("RedisManager.saveObject: " + key);
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

    public incrementCounter(keys: string[]) {
        winston.debug("RedisManager.incrementCounter: " + keys ? keys.join(",") : "undefined");
        return new Promise<Number>(async resolve => {
            if ( keys.length == 1 ) {
                resolve(await RedisManager.instance.incrementCounterValue(keys[0]));
            } else {
                resolve(await RedisManager.instance.incrementComposedCounterValue(keys));
            }
        });
    }

    private incrementCounterValue(counterKey: string) {
        winston.debug("RedisManager.incrementCounterValue: " + counterKey);
        return new Promise<number>(async resolve => {
            const value = await RedisManager.instance.getValue(counterKey);
            const increment = (value != null) ? Number.parseInt(value) : 1;
            await RedisManager.instance.setValue(counterKey, (increment + 1) + "");
            resolve(increment);
        });
    }

    private incrementComposedCounterValue(keys: string[]) {
        winston.debug("RedisManager.incrementComposedCounterValue: " + keys ? keys.join(",") : "undefined");
        return new Promise<number>(async resolve => {
            var key = "composed";
            keys.forEach(k => {
                key += "$$" + k;
            });
            const value = await RedisManager.instance.getValue(key);
            const increment = (value != null) ? Number.parseInt(value) : 1;
            await RedisManager.instance.setValue(key, (increment + 1) + "");
            resolve(increment);
        });
    }

    public async checkValues(values: string[]) {
        winston.debug("RedisManager.checkValues: " + values ? values.join(",") : "undefined")
        return new Promise<boolean>((resolve) => {
            if ( values.length > 0 ) {
                const promises = values.map(v => { return RedisManager.instance.getValue(v); });
                Promise.all(promises).then(valuesComputed => {
                    resolve(valuesComputed.every(v => { return v != null }));
                }).catch(() => {
                    resolve(false);
                });
            } else {
                resolve(true);
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