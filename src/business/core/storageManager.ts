import { RedisManager } from "./redisManager";

export class StorageManager {
    private static _instance : StorageManager;

    public getValue(key: string, member: string) {
        return RedisManager.instance.hget(key, member);
    }

    public storeValue(key: string, member: string, value: string) {
        return RedisManager.instance.hset(key, member, value);
    }

    public static get instance() {
        if (!StorageManager._instance) {
            StorageManager._instance = new StorageManager();
        }
        return StorageManager._instance;
    }
}