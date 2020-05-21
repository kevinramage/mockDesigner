import * as winston from "winston";
import { RedisManager } from "./redisManager";

export interface IBehaviourData {
    name: string;
    repeat?: number;
}

export class BehaviourManager {
    
    public static async getBehaviour(key: string, name: string) {
        winston.debug("BehaviourManager.getBehaviour");
        const finalKey = "__behaviour__" + key;
        const textValue = await RedisManager.instance.getValue(finalKey);
        const data = textValue ? JSON.parse(textValue) as IBehaviourData[] : [];
        return data.find(elt => { return elt.name == name; });
    }

    public static async getAllBehaviours(key: string) {
        winston.debug("BehaviourManager.getAllBehaviours");
        const finalKey = "__behaviour__" + key;
        const textValue = await RedisManager.instance.getValue(finalKey);
        const data = textValue ? JSON.parse(textValue) as IBehaviourData[] : [];
        return data;
    }

    public static async createBehaviour(key: string, name: string, expired: number | undefined) {
        winston.debug("BehaviourManager.createBehaviour");
        const finalKey = "__behaviour__" + key;
        if ( name ) {
            var eltPresent = false, data: IBehaviourData[] = [];
            var elt = { name: name };
            const textValue = await RedisManager.instance.getValue(finalKey);
            if ( textValue ) {
                data = JSON.parse(textValue) as IBehaviourData[];
                eltPresent = data.find((elt : IBehaviourData) => { return elt.name == name}) != undefined;
            }
            if ( !eltPresent ) {
                data.push(elt);
                const DEFAULT_EXPIRATION = 60 * 60 * 10;
                await RedisManager.instance.setExValue(finalKey, expired || DEFAULT_EXPIRATION, JSON.stringify(data));
            }
            return elt;
        } else {
            return null;
        }
    }

    public static async deleteBehaviour(key: string, name: string) {
        winston.debug("BehaviourManager.deleteBehaviour");
        const finalKey = "__behaviour__" + key;
        const textValue = await RedisManager.instance.getValue(finalKey);
        const data = textValue ? JSON.parse(textValue) as IBehaviourData[] : [];
        const index = data.findIndex((elt : IBehaviourData) => { return elt.name == name});
        if ( index != -1 ) {
            const removed = data.splice(index, 1);
            await RedisManager.instance.setValue(finalKey, JSON.stringify(data));
            return removed;
        } else {
            return null;
        }
    }

    public static async deleteAllBehaviours(key: string) {
        winston.debug("BehaviourManager.deleteAllBehaviours");
        const finalKey = "__behaviour__" + key;
        await RedisManager.instance.setValue(finalKey, "[]");
        return null;
    }

    public static async updateBehaviour(key: string, name: string, repeat: number, expired: number | undefined) {
        winston.debug("BehaviourManager.updateBehaviour");
        const finalKey = "__behaviour__" + key;
        const textValue = await RedisManager.instance.getValue(finalKey);
        const data = textValue ? JSON.parse(textValue) as IBehaviourData[] : [];
        const index = data.findIndex((elt : IBehaviourData) => { return elt.name == name});
        if ( index != -1 ) {
            data[index].repeat = repeat;
            const DEFAULT_EXPIRATION = 60 * 60 * 10;
            await RedisManager.instance.setExValue(finalKey, expired || DEFAULT_EXPIRATION, JSON.stringify(data));
            return data[index];
        } else {
            return null;
        }
    }

    public static async decreaseRepeat(key: string, name: string, repeat: number) {
        winston.debug("BehaviourManager.decreaseRepeat");
        const finalKey = "__behaviour__" + key;
        const textValue = await RedisManager.instance.getValue(finalKey);
        const data = textValue ? JSON.parse(textValue) as IBehaviourData[] : [];
        const index = data.findIndex((elt : IBehaviourData) => { return elt.name == name});
        if ( index != -1 ) {
            
            // Not defined
            if ( !data[index].repeat) {
                const DEFAULT_EXPIRATION = 60 * 60 * 10;
                if ( repeat != -1 && repeat > 1 ) {
                    await BehaviourManager.updateBehaviour(key, name, repeat - 1, DEFAULT_EXPIRATION);
                } else if ( repeat != -1 ) {
                    await BehaviourManager.deleteBehaviour(key, name);
                }

            // Defined
            } else if ( data[index].repeat != -1) {
                const DEFAULT_EXPIRATION = 60 * 60 * 10;
                if ( data[index].repeat as number > 1 ) {
                    const repeat = data[index].repeat as number - 1;
                    await BehaviourManager.updateBehaviour(key, name, repeat, DEFAULT_EXPIRATION);
                } else {
                    await BehaviourManager.deleteBehaviour(key, name);
                }
            }

        } else {
            return null;
        }
    }
}