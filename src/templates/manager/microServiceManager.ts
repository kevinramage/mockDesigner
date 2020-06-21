import * as util from "util";
import { Response } from "express";
import { Context } from "../context";
import { TemplateManager } from "./templateManager";
import { RedisManager } from "./redisManager";
import { ResponseHandler } from "./responseHandler";

export interface IStorage {
    businessObject: string;
    propertyName: string;
    propertyValue: string;
    parent ?: IStorageParent;
}
export interface IStorageParent {
    businessObject: string;
    propertyValue: string;
    parent ?: IStorageParent;
}

export class MicroServiceManager {

    private static defineParentKey(storage ?: IStorageParent) : string {
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
        if ( storage ) {
            const parentKeys = MicroServiceManager.getParentKeys(storage.parent);
            const parentKey = util.format("%s.%s", storage.businessObject, storage.propertyValue);
            return [parentKey].concat(parentKeys);
        } else {
            return [];
        }
    }

    private static async evaluateParentId(context: Context, storage ?: IStorageParent) {
        return new Promise<IStorageParent>(async (resolve) => {
            if ( storage ) {
                storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
                storage.propertyValue = await TemplateManager.instance.evaluate(storage.propertyValue, context);
                resolve(storage);
            } else {
                resolve(storage);
            }
        });
    }

    public static async getAllObjects(context: Context, res: Response, storage: IStorage) {

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
                    await ResponseHandler.sendDefaultJSONResourceNotFound(res);
                    return;
                }
            }

            // Get objects from redis
            const objects = RedisManager.instance.getAllObjectsWrapper(parentBusinessObjectKey);

            // Send 200 response
            const headers : { [ key: string ] : string } = {};
            headers["Content-Type"] = "application/json";
            await ResponseHandler.sendContent(context, res, 200, JSON.stringify(objects), headers);        

        } catch (err) {
            await ResponseHandler.sendDefaultJSONInternalError(res);
        }

    }

    public static async getObjectById(context: Context, res: Response, storage: IStorage) {

        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue, context);
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
                    await ResponseHandler.sendDefaultJSONResourceNotFound(res);
                    return;
                }
            }

            // Get object in redis
            const object = await RedisManager.instance.getObjectWrapper(businessObjectKey);

            // Send 201 response
            const headers : { [ key: string ] : string } = {};
            headers["Content-Type"] = "application/json";
            await ResponseHandler.sendContent(context, res, 200, JSON.stringify(object), headers);

        } catch (err) {
            await ResponseHandler.sendDefaultJSONInternalError(res);
        }
    }

    public static async createObject(context: Context, res: Response, storage: IStorage, dataExpression: string, expiration: number) {
        
        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue, context);
            const businessObjectKey = util.format("%s.%s", storage.businessObject, businessObjectId);

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }
            const parentBusinessObjectKey = util.format("list%s%s", storage.businessObject, parentKey);

            // Evaluate data
            const dataEvaluated = await TemplateManager.instance.evaluate(dataExpression, context);
            const data = JSON.parse(dataEvaluated);
            data[storage.propertyName] = businessObjectId;

            // Check parent
            const parents = MicroServiceManager.getParentKeys(storage.parent);
            const promises = parents.map((parent) => { return RedisManager.instance.objectExists(parent); });
            if ( promises.length > 0 ) {
                const results = await Promise.all(promises);
                const result = results.reduce((previous, current) => { return previous && current; });
                if ( !result ) {
                    await ResponseHandler.sendDefaultJSONResourceNotFound(res);
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
            await ResponseHandler.sendDefaultJSONInternalError(res);
        }
    }

    public static async updateObject(context: Context, res: Response, storage: IStorage, dataExpression: string, expiration: number) {

        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue, context);
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
                    await ResponseHandler.sendDefaultJSONResourceNotFound(res);
                    return;
                }
            }

            // Update object in redis
            const result = RedisManager.instance.updateObjectWrapper(businessObjectKey, data, expiration);

            if ( result ) {
                const headers : { [ key: string ] : string } = {};
                headers["Content-Type"] = "application/json";
                await ResponseHandler.sendContent(context, res, 200, JSON.stringify(data), headers);

            } else {
                await ResponseHandler.sendDefaultJSONResourceNotFound(res);
            }


        } catch (err) {
            await ResponseHandler.sendDefaultJSONInternalError(res);
        }
    }

    public static async updateDeltaObject(context: Context, res: Response, storage: IStorage, dataExpression: string, expiration: number) {

        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue, context);
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
                    await ResponseHandler.sendDefaultJSONResourceNotFound(res);
                    return;
                }
            }

            // Update object in redis
            const result = RedisManager.instance.updateDeltaWrapper(businessObjectKey, data, expiration);

            if ( result ) {
                const headers : { [ key: string ] : string } = {};
                headers["Content-Type"] = "application/json";
                await ResponseHandler.sendContent(context, res, 200, JSON.stringify(data), headers);

            } else {
                await ResponseHandler.sendDefaultJSONResourceNotFound(res);
            }

        } catch (err) {
            await ResponseHandler.sendDefaultJSONInternalError(res);
        }
    }

    public static async deleteObject(context: Context, res: Response, storage: IStorage) {

        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue, context);
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
                    await ResponseHandler.sendDefaultJSONResourceNotFound(res);
                    return;
                }
            }

            // Delete object in redis
            const result = RedisManager.instance.deleteObjectWrapper(businessObjectKey, parentBusinessObjectKey);

            if ( result ) {
                const headers : { [ key: string ] : string } = {};
                headers["Content-Type"] = "application/json";
                await ResponseHandler.sendContent(context, res, 204, "", headers);

            } else {
                await ResponseHandler.sendDefaultJSONResourceNotFound(res);
            }

        } catch (err) {
            await ResponseHandler.sendDefaultJSONInternalError(res);
        }
    }

    public static async deleteAllObjects(context: Context, res: Response, storage: IStorage) {

        try {

            // Evaluate business object
            const businessObjectId = await TemplateManager.instance.evaluate(storage.propertyValue, context);
            const businessObjectKey = util.format("%s.%s", storage.businessObject, businessObjectId);

            // Evaluate parent business object
            storage.parent = await MicroServiceManager.evaluateParentId(context, storage.parent);
            var parentKey = MicroServiceManager.defineParentKey(storage.parent);
            if ( parentKey ) { parentKey = "_" + parentKey; }
            const parentBusinessObjectKey = util.format("list%s%s", storage.businessObject, parentKey);
            


        } catch (err) {
            await ResponseHandler.sendDefaultJSONInternalError(res);
        }
    }

    public static async searchObjects(context: Context, res: Response, storage: IStorage) {

        try {

        } catch (err) {
            await ResponseHandler.sendDefaultJSONInternalError(res);
        }
    }

    public static async enableObject(context: Context, res: Response, storage: IStorage) {

        try {

        } catch (err) {
            await ResponseHandler.sendDefaultJSONInternalError(res);
        }
    }

    public static async disableObject(context: Context, res: Response, storage: IStorage) {

        try {

        } catch (err) {
            await ResponseHandler.sendDefaultJSONInternalError(res);
        }
    }

    public static async disableObjects(context: Context, res: Response, storage: IStorage) {

        try {

        } catch (err) {
            await ResponseHandler.sendDefaultJSONInternalError(res);
        }
    }
}