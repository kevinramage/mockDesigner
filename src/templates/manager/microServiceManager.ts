import * as winston from "winston";
import * as util from "util";
import { Response } from "express";
import { Context } from "../context";
import { TemplateManager } from "./templateManager";
import { RedisManager } from "./redisManager";
import { ResponseHandler } from "./responseHandler";

export interface IStorage {
    businessObject ?: string;
    propertyName ?: string;
    propertyValue ?: string;
    parent ?: IStorageParent;
}
export interface IStorageParent {
    businessObject ?: string;
    propertyValue ?: string;
    parent ?: IStorageParent;
}

export class MicroServiceManager {

    private static defineParentKey(storage ?: IStorageParent) : string {
        winston.debug("MicroServiceManager.defineParentKey");
        if ( storage ) {
            if ( storage.parent ) {
                const parentKey = MicroServiceManager.defineParentKey(storage.parent);
                return util.format("%s%s_%s", storage.businessObject, storage.propertyValue, parentKey);
            } else {
                return util.format("%s%s", storage.businessObject, storage.propertyValue);
            }
        } else {
            return "";
        }
    }

    private static getParentKeys(storage ?: IStorageParent) : string[] {
        winston.debug("MicroServiceManager.getParentKeys");
        if ( storage ) {
            const parentKeys = MicroServiceManager.getParentKeys(storage.parent);
            const parentKey = util.format("%s.%s", storage.businessObject, storage.propertyValue);
            return [parentKey].concat(parentKeys);
        } else {
            return [];
        }
    }

    private static async evaluateParentId(context: Context, storage ?: IStorageParent) {
        winston.debug("MicroServiceManager.evaluateParentId");
        return new Promise<IStorageParent>(async (resolve) => {
            if ( storage ) {
                storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
                storage.propertyValue = await TemplateManager.instance.evaluate(storage.propertyValue as string, context);
                resolve(storage);
            } else {
                resolve(storage);
            }
        });
    }

    public static async getAllObjects(context: Context, res: Response, storage: IStorage) {
        winston.debug("MicroServiceManager.getAllObjects");
        try {

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }
            const parentBusinessObjectKey = util.format("list%s%s", storage.businessObject, parentKey);

            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Get objects from redis
            const objects = await RedisManager.instance.getAllObjectsWrapper(parentBusinessObjectKey);

            // Send 200 response
            const headers : { [ key: string ] : string } = {};
            headers["Content-Type"] = "application/json";
            await ResponseHandler.sendContent(context, res, 200, JSON.stringify(objects), headers);        

        } catch (err) {
            winston.error("MicroServiceManager.getAllObjects: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }

    }

    public static async getObjectById(context: Context, res: Response, storage: IStorage) {
        winston.debug("MicroServiceManager.getObjectById");
        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue as string, context);
            const businessObjectKey = util.format("%s.%s", storage.businessObject, businessObjectId);

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }

            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Get object in redis
            const object = await RedisManager.instance.getObjectWrapper(businessObjectKey);

            // Send 
            if ( object ) {
                const headers : { [ key: string ] : string } = {};
                headers["Content-Type"] = "application/json";
                await ResponseHandler.sendContent(context, res, 200, JSON.stringify(object), headers);
            } else {
                await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
            }

        } catch (err) {
            winston.error("MicroServiceManager.getObjectById: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }
    }

    public static async createObject(context: Context, res: Response, storage: IStorage, dataExpression: string, expiration: number) {
        winston.debug("MicroServiceManager.createObject");
        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue as string, context);
            const businessObjectKey = util.format("%s.%s", storage.businessObject, businessObjectId);

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }
            const parentBusinessObjectKey = util.format("list%s%s", storage.businessObject, parentKey);

            // Evaluate data
            const dataEvaluated = await TemplateManager.instance.evaluate(dataExpression, context);
            const data = JSON.parse(dataEvaluated);
            data[storage.propertyName as string] = businessObjectId;

            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Create object in redis
            await RedisManager.instance.createObjectWrapper(businessObjectKey, parentBusinessObjectKey, data, expiration);

            // Send 201 response
            const headers : { [ key: string ] : string } = {};
            headers["Content-Type"] = "application/json";
            await ResponseHandler.sendContent(context, res, 201, JSON.stringify(data), headers);

        } catch (err) {
            winston.error("MicroServiceManager.createObject: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }
    }

    public static async updateObject(context: Context, res: Response, storage: IStorage, dataExpression: string, expiration: number) {
        winston.debug("MicroServiceManager.updateObject");
        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue as string, context);
            const businessObjectKey = util.format("%s.%s", storage.businessObject, businessObjectId);

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }

            // Evaluate data
            const dataEvaluated = await TemplateManager.instance.evaluate(dataExpression, context);
            const data = JSON.parse(dataEvaluated);

            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Update object in redis
            if ( data.__enabled == undefined ) {
                data.__enabled = true;
            }
            const result = await RedisManager.instance.updateObjectWrapper(businessObjectKey, data, expiration);

            // Send response
            if ( result ) {
                const headers : { [ key: string ] : string } = {};
                headers["Content-Type"] = "application/json";
                await ResponseHandler.sendContent(context, res, 200, dataEvaluated, headers);

            } else {
                await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
            }


        } catch (err) {
            winston.error("MicroServiceManager.updateObject: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }
    }

    public static async updateDeltaObject(context: Context, res: Response, storage: IStorage, dataExpression: string, expiration: number) {
        winston.debug("MicroServiceManager.updateDeltaObject");
        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue as string, context);
            const businessObjectKey = util.format("%s.%s", storage.businessObject, businessObjectId);

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }

            // Evaluate data
            const dataEvaluated = await TemplateManager.instance.evaluate(dataExpression, context);
            const data = JSON.parse(dataEvaluated);

            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Update object in redis
            const result = await RedisManager.instance.updateDeltaWrapper(businessObjectKey, data, expiration);
            console.info("result");
            console.info(result);

            if ( result ) {
                const headers : { [ key: string ] : string } = {};
                headers["Content-Type"] = "application/json";
                await ResponseHandler.sendContent(context, res, 200, JSON.stringify(result), headers);

            } else {
                await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
            }

        } catch (err) {
            winston.error("MicroServiceManager.updateDeltaObject: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }
    }

    public static async updateDeltaAllObject(context: Context, res: Response, storage: IStorage, dataExpression: string, expiration: number) {
        winston.debug("MicroServiceManager.updateDeltaAllObject");
        try {

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }
            const parentBusinessObjectKey = util.format("list%s%s", storage.businessObject, parentKey);
            
            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Evaluate data
            const dataEvaluated = await TemplateManager.instance.evaluate(dataExpression, context);
            const data = JSON.parse(dataEvaluated);

            // Update all objects
            const objects = await RedisManager.instance.updateDeltaAllObjectsWrapper(parentBusinessObjectKey, data, expiration);

            // Send response
            const headers : { [ key: string ] : string } = {};
            headers["Content-Type"] = "application/json";
            await ResponseHandler.sendContent(context, res, 200, JSON.stringify(objects), headers);

        } catch (err) {
            winston.error("MicroServiceManager.updateDeltaAllObject: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }
    }

    public static async deleteObject(context: Context, res: Response, storage: IStorage) {
        winston.debug("MicroServiceManager.deleteObject");
        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue as string, context);
            const businessObjectKey = util.format("%s.%s", storage.businessObject, businessObjectId);

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }
            const parentBusinessObjectKey = util.format("list%s%s", storage.businessObject, parentKey);
            
            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Delete object in redis
            const result = await RedisManager.instance.deleteObjectWrapper(businessObjectKey, parentBusinessObjectKey);

            if ( result ) {
                const headers : { [ key: string ] : string } = {};
                headers["Content-Type"] = "application/json";
                await ResponseHandler.sendContent(context, res, 204, "", headers);

            } else {
                await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
            }

        } catch (err) {
            winston.error("MicroServiceManager.deleteObject: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }
    }

    public static async deleteAllObjects(context: Context, res: Response, storage: IStorage) {
        winston.debug("MicroServiceManager.deleteAllObjects");
        try {

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }
            const parentBusinessObjectKey = util.format("list%s%s", storage.businessObject, parentKey);
            
            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Delete object in redis
            RedisManager.instance.deleteAllObjectsWrapper(parentBusinessObjectKey);

            // Send response
            const headers : { [ key: string ] : string } = {};
            headers["Content-Type"] = "application/json";
            await ResponseHandler.sendContent(context, res, 204, "", headers);

        } catch (err) {
            winston.error("MicroServiceManager.deleteAllObjects: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }
    }

    public static async searchObjects(context: Context, res: Response, storage: IStorage) {
        winston.debug("MicroServiceManager.searchObjects");
        try {

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }
            const parentBusinessObjectKey = util.format("list%s%s", storage.businessObject, parentKey);
            
            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Search object
            const queries : {[key: string]: string} = {};
            if ( context.request?.query ) {
                Object.keys(context.request.query).forEach(key => {
                    queries[key] = context.request?.query[key] as string;
                });
            }
            const instances = await RedisManager.instance.searchObjectWrapper(parentBusinessObjectKey, queries);

            // Send response
            const headers : { [ key: string ] : string } = {};
            headers["Content-Type"] = "application/json";
            await ResponseHandler.sendContent(context, res, 200, JSON.stringify(instances), headers);

        } catch (err) {
            winston.error("MicroServiceManager.searchObjects: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }
    }

    public static async enableObject(context: Context, res: Response, storage: IStorage, expiration: number) {
        winston.debug("MicroServiceManager.enableObject");
        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue as string, context);
            const businessObjectKey = util.format("%s.%s", storage.businessObject, businessObjectId);

            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Enable object
            const object = await RedisManager.instance.enableObjectWrapper(businessObjectKey, expiration);

            // Send response
            if ( object ) {
                const headers : { [ key: string ] : string } = {};
                headers["Content-Type"] = "application/json";
                await ResponseHandler.sendContent(context, res, 200, JSON.stringify(object), headers);
            } else {
                await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
            }

        } catch (err) {
            winston.error("MicroServiceManager.enableObject: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }
    }

    public static async disableObject(context: Context, res: Response, storage: IStorage, expiration: number) {
        winston.debug("MicroServiceManager.disableObject");
        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue as string, context);
            const businessObjectKey = util.format("%s.%s", storage.businessObject, businessObjectId);

            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Enable object
            const object = await RedisManager.instance.disableObjectWrapper(businessObjectKey, expiration);

            // Send response
            if ( object ) {
                const headers : { [ key: string ] : string } = {};
                headers["Content-Type"] = "application/json";
                await ResponseHandler.sendContent(context, res, 200, JSON.stringify(object), headers);
            } else {
                await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
            }

        } catch (err) {
            winston.error("MicroServiceManager.disableObject: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }
    }

    public static async disableObjects(context: Context, res: Response, storage: IStorage, expiration: number) {
        winston.debug("MicroServiceManager.disableObjects");
        try {

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }
            const parentBusinessObjectKey = util.format("list%s%s", storage.businessObject, parentKey);
            
            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(context, res);
                    return;
                }
            }

            // Disable all objects
            const instances = await RedisManager.instance.disableAllObjectsWrapper(parentBusinessObjectKey, expiration);

            // Send response
            const headers : { [ key: string ] : string } = {};
            headers["Content-Type"] = "application/json";
            await ResponseHandler.sendContent(context, res, 200, JSON.stringify(instances), headers);

        } catch (err) {
            winston.error("MicroServiceManager.disableObjects: ", err);
            await ResponseHandler.sendDefaultJSONInternalError(context, res);
        }
    }
}