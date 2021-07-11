import { format } from "util";
import { RedisManager } from "./redisManager";

export class BehaviourManager {
    private static _instance : BehaviourManager;

    public getBehaviours(name: string) {
        return new Promise<string[]>(async (resolve, reject) => {
            try {
                const key = format("behaviours__%s", name);
                const behaviours = await RedisManager.instance.smembers(key);
                if (behaviours) {
                    resolve(behaviours);
                } else {
                    resolve([]);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    public getBehaviour(name: string, code: string) {
        return new Promise<string | null>(async (resolve, reject) => {
            try {
                const key = format("behaviours__%s", name);
                const behaviour = await RedisManager.instance.smember(key, code);
                if (behaviour) {
                    resolve(behaviour);
                } else {
                    resolve(null);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    public createBehaviour(name: string, code: string) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const key = format("behaviours__%s", name);
                await RedisManager.instance.sadd(key, code);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    public deleteBehaviour(name: string, code: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                const key = format("behaviours__%s", name);
                const result = await RedisManager.instance.srem(key, code);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    public static get instance() {
        if (!BehaviourManager._instance) {
            BehaviourManager._instance = new BehaviourManager();
        }
        return BehaviourManager._instance;
    }
}