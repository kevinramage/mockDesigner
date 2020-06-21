import * as winston from "winston";
import * as redis from "redis";
import * as util from "util";

export class RedisManager {
    public static MAX_ELEMENTS = 100;
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
        return new Promise<string|null>((resolve, reject) => {
            if ( this._client ) {
                this._client.get(key, (err, value) => {
                    if ( !err ) {
                        if ( value && value != "") {
                            resolve(value);
                        } else {
                            resolve(null);
                        }
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

    private incrementValue(key: string) {
        winston.debug("RedisManager.incrementValue: " + key);
        return new Promise<number>((resolve, reject) => {
            if ( this._client ) {
                this._client.incrby(key, 1, (err, value) => {
                    if ( !err ) {
                        resolve(value);
                    } else {
                        winston.error("RedisManager.incrementValue: Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                winston.error("RedisManager.incrementValue: Redis client null or undefined");
                reject("Redis client null or undefined");
            }
        });
    }

    private getValues(keys: string[]) {
        winston.debug("RedisManager.getValues");
        const instance = this;
        return new Promise<object[]>((resolve, reject) => {
            const promises = keys.map(key => { return instance.getObjectWrapper(key); });
            if ( promises.length > 0 ) {
                Promise.all(promises).then((data) => {
                    const objects : object[] = data.filter(obj => { return obj != null}) as object[];
                    resolve(objects);
                }).catch((err) => {
                    reject(err);
                });
            } else {
                resolve([]);
            }
        });
    }

    private filterObject(obj: object ) {

    }

    public objectExists(key: string) {
        winston.debug("RedisManager.objectExists: " + key);
        const instance = this;
        return new Promise<boolean>((resolve, reject) => {
            instance.getObjectWrapper(key).then((data) => {
                resolve(data != null);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    private updateDeltaObject(source: Object, delta: object) {
        winston.debug("RedisManager.updateDeltaObject");
        Object.keys(delta).forEach(key => {
            const sourceProperty = Object.getOwnPropertyDescriptor(delta, key);
            const deltaPropertyValue = Object.getOwnPropertyDescriptor(delta, key)?.value;

            if ( sourceProperty && sourceProperty.value) {

                // Complex type
                if ( typeof deltaPropertyValue ) {

                    // Array
                    if ( deltaPropertyValue.length ) {
                        for ( var index in deltaPropertyValue ) {
                            if ( sourceProperty.value[index] ) {
                                this.updateDeltaObject(sourceProperty.value[index], deltaPropertyValue.value[index])
                            } else {
                                sourceProperty.value[index] = deltaPropertyValue.value[index];
                            }
                        }
                    } else {
                        this.updateDeltaObject(sourceProperty.value, deltaPropertyValue);
                    }

                } else if ( sourceProperty.value != deltaPropertyValue ) {
                    Object.defineProperty(source, key, { value: deltaPropertyValue});
                }

            } else {
                Object.defineProperty(source, key, { value: deltaPropertyValue});
            }
        });
        return source;
    }

    // ----------------------------------------
    // LIST
    // ----------------------------------------

    private addElementToList(key: string, elementKeyId: string) {
        winston.debug(util.format("RedisManager.addElementToList: %s to %s", elementKeyId, key));
        const instance = this;
        return new Promise<void>((resolve, reject) => {
            if ( instance._client ) {
                instance._client.rpush(key, elementKeyId, (err) => {
                    if ( !err) {
                        resolve();
                    } else {
                        winston.error("RedisManager.addElementToList: Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                winston.error("RedisManager.addElementToList: Redis client null or undefined");
                reject("Redis client null or undefined");
            }
        });
    }

    private deleteElementToList(key: string, elementKeyId: string) {
        winston.debug(util.format("RedisManager.deleteElementToList: %s to %s", elementKeyId, key));
        const instance = this;
        return new Promise<void>((resolve, reject) => {
            if ( instance._client ) {
                instance._client.lrem(key, 1, elementKeyId, (err) => {
                    if ( !err) {
                        resolve();
                    } else {
                        winston.error("RedisManager.deleteElementToList: Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                winston.error("RedisManager.deleteElementToList: Redis client null or undefined");
                reject("Redis client null or undefined");
            }
        });
    }

    private getElementsFromList(key: string) {
        winston.debug(util.format("RedisManager.getElementsFromList: %s", key));
        const instance = this;
        return new Promise<string[]>((resolve, reject) => {
            if ( instance._client ) {
                instance._client.lrange(key, 0, RedisManager.MAX_ELEMENTS, (err, value) => {
                    if ( !err) {
                        resolve(value);
                    } else {
                        winston.error("RedisManager.getElementsFromList: Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                winston.error("RedisManager.getElementsFromList: Redis client null or undefined");
                reject("Redis client null or undefined");
            }
        });
    }


    // ----------------------------------------
    // Wrapper
    // ----------------------------------------

    public getAllObjectsWrapper(listKey: string) {
        winston.debug("RedisManager.getAllObjectsWrapper: " + listKey);
        const instance = this;
        return new Promise<Object[]>(async (resolve, reject) => {
            const elementsIds = await instance.getElementsFromList(listKey);
            const objects = await instance.getValues(elementsIds);
            resolve(objects);
        });
    }

    public getObjectWrapper(elementKey: string) {
        winston.debug("RedisManager.getObjectWrapper: " + elementKey);
        const instance = this;
        return new Promise<Object|null>(async (resolve) => {
            const value = await instance.getValue(elementKey);
            if ( value != null ) {
                resolve(JSON.parse(value));
            } else {
                resolve(null);
            }
        });
    }

    public createObjectWrapper(elementKey: string, listKey: string, obj: object, expiration: number) {
        winston.debug("RedisManager.addObject: " + listKey);
        const instance = this;
        return new Promise<void>((resolve, reject) => {
            const createObjectPromise = instance.setExValue(elementKey, expiration, JSON.stringify(obj));
            const addObjectToListPromise = instance.addElementToList(listKey, elementKey);
            Promise.all([createObjectPromise, addObjectToListPromise]).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    public updateObjectWrapper(elementKey: string, obj: object, expiration: number) {
        winston.debug("RedisManager.updateObjectWrapper: " + elementKey);
        const instance = this;
        return new Promise<object| null>(async (resolve) => {
            const exists = await instance.objectExists(elementKey);
            if ( exists ) {
                await instance.setExValue(elementKey, expiration, JSON.stringify(obj));
                resolve(obj);
            } else {
                resolve(null);
            }
        });
    }

    public updateDeltaWrapper(elementKey: string, obj: object, expiration: number) {
        winston.debug("RedisManager.updateDeltaWrapper: " + elementKey);
        const instance = this;
        return new Promise<object | null>(async (resolve) => {
            const exists = await instance.objectExists(elementKey);
            if ( exists ) {
                const oldObject = await instance.getObjectWrapper(elementKey) as object;
                const newObject = instance.updateDeltaObject(oldObject, obj);
                await instance.setExValue(elementKey, expiration, JSON.stringify(newObject));
                resolve(newObject);
            } else {
                resolve(null);
            }
        });
    }

    public deleteObjectWrapper(elementKey: string, listKey: string) {
        winston.debug("RedisManager.deleteObjectWrapper: " + elementKey);
        const instance = this;
        return new Promise<Boolean>(async (resolve) => {
            const result = await instance.objectExists(elementKey);
            if ( result ) {
                await instance.deleteValue(elementKey);
                await instance.deleteElementToList(listKey, elementKey);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    public deleteAllObjectsWrapper(listKey: string) {
        winston.debug("RedisManager.deleteAllObjectsWrapper: " + listKey);
        const instance = this;
        return new Promise<void>(async (resolve, reject) => {
            const elementsKey = await instance.getElementsFromList(listKey);
            const promises = elementsKey.map(eltKey => { return instance.deleteObjectWrapper(eltKey, listKey); });
            Promise.all(promises).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    public searchObjectWrapper(key: string) {
        
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
            const increment = await RedisManager.instance.incrementValue(counterKey);
            resolve(increment);
        });
    }

    private incrementComposedCounterValue(keys: string[]) {
        winston.debug("RedisManager.incrementComposedCounterValue: " + keys ? keys.join(",") : "undefined");
        return new Promise<number>(async resolve => {
            var key = "composed";
            keys.forEach(k => { key += "$$" + k; });
            const increment = await RedisManager.instance.incrementValue(key);
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