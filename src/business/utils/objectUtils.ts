import { createHash } from "crypto";

const crypto = require('crypto');

export class ObjectUtils {
    public static createHash(object: any) {
        
        return new Promise<string>(async (resolve, reject) => {
            try {
                const hexa = await createHash("sha256").update(JSON.stringify(object)).digest("hex").toString();
                resolve(hexa);
            } catch (err) {
                reject(err);
            }
        });
    }

    public static getSubObject(object: any, filter: string) {
        if (!object) { return undefined; }

        if (filter.includes(".")) {
            const index = filter.indexOf(".");
            const newObject = object[filter.substr(0, index)];
            const newFilter = filter.substr(index+1);
            return ObjectUtils.getSubObject(newObject, newFilter);
        } else {
            return object[filter];
        }
    }

    public static filterObject(object: any, filter: string, value: string) {
        const objectIdentified = ObjectUtils.getSubObject(object, filter);
        if (objectIdentified) {
            return objectIdentified == value;
        } else {
            return false;
        }
    }
}