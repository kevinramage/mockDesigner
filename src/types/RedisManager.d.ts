export class RedisManager {
    static instance : RedisManager;
    getValue(key: string) : Promise<string>;
    setValue(key: string, value: string) : Promise<void>;
    increment(key: string) : Promise<number>;
}