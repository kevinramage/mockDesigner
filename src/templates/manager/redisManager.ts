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

    private async incrementValue(key: string) {
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

    // ----------------------------------------
    // OBJECT
    // ----------------------------------------

    private async getObject(key: string) {
        winston.debug("RedisManager.getObject: " + key);
        return new Promise<object | null>((resolve, reject) => {
            if ( this._client ) {
                this._client.hgetall(key, (err, value) => {
                    if ( !err ) {
                        var obj = {};
                        Object.keys(value).forEach(k => {
                            Object.defineProperty(obj, k, { value: value[k] })
                        });
                        if ( value && Object.keys(value).length > 0 ) {
                            resolve(obj);
                        } else {
                            resolve(null);
                        }
                    } else {
                        winston.error("RedisManager.getObject: Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                winston.error("RedisManager.getObject: Redis client null or undefined");
                reject("Redis client null or undefined");
            }
        });
    }

    private async setObject(key: string, obj: object, expiration: number) {
        winston.debug("RedisManager.setObject: " + key);
        return new Promise<void>((resolve, reject) => {
            const instance = this;
            if ( instance._client ) {
                const promises = Object.keys(obj).map((k) => {
                    const value = Object.getOwnPropertyDescriptor(obj, key)?.value;
                    return RedisManager.instance.setObjectField(key, k, value, expiration);
                });
                Promise.all(promises).then(() => {
                    resolve();
                }).catch((err) => {
                    winston.error("RedisManager.setObject: Internal error: ", err);
                    reject(err);
                });
            } else {
                winston.error("RedisManager.getObject: Redis client null or undefined");
                reject("Redis client null or undefined");
            }
        });
    }

    private setObjectField(key: string, propertyName: string, propertyValue: string, expiration: number) {
        const instance = this;
        return new Promise<void>((resolve, reject) => {
            instance._client?.hset(key, propertyName, propertyValue, (err) => {
                if ( !err) {
                    instance._client?.expire(key, expiration, (err)=> {
                        if ( !err ) {
                            resolve();
                        } else {
                            reject(err);
                        }
                    });
                } else {
                    reject(err);
                }
            });
        });
    }

    private deleteObject(key: string) {
        winston.debug("RedisManager.deleteObject: " + key);
        return new Promise<object | null>((resolve, reject) => {
            if ( this._client ) {
                this._client.hdel(key, (err) => {
                    if ( !err ) {
                        resolve();
                    } else {
                        winston.error("RedisManager.deleteObject: Internal error: ", err);
                        reject(err);
                    }
                });
            } else {
                winston.error("RedisManager.deleteObject: Redis client null or undefined");
                reject("Redis client null or undefined");
            }
        });
    }

    private getObjects(keys: string[]) {
        winston.debug("RedisManager.getObjects");
        const instance = this;
        return new Promise<object[]>((resolve, reject) => {
            const promises = keys.map(key => { return instance.getObject(key); });
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
            instance.getObject(key).then((data) => {
                resolve(data != null);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    private updateDeltaObject(source: Object, delta: object) {
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
            const objects = await instance.getObjects(elementsIds);
            resolve(objects);
        });
    }

    public getObjectWrapper(elementKey: string) {
        return this.getObject(elementKey);
    }

    public createObjectWrapper(elementKey: string, listKey: string, obj: object, expiration: number) {
        winston.debug("RedisManager.addObject: " + listKey);
        const instance = this;
        return new Promise<void>((resolve, reject) => {
            const createObjectPromise = instance.setObject(elementKey, obj, expiration);
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
                await instance.setObject(elementKey, obj, expiration);
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
                const oldObject = await instance.getObject(elementKey) as object;
                const newObject = instance.updateDeltaObject(oldObject, obj);
                await instance.setObject(elementKey, newObject, expiration);
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
                await instance.deleteObject(elementKey);
                await instance.deleteElementToList(listKey, elementKey);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    public searchObjectWrapper(key: string) {
        
    }


    /*
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
    */

    /*
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
    */

    /*
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
    */

    /*
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
    */

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