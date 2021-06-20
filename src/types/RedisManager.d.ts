export class RedisManager {
    static instance : RedisManager;
    getValue(key: string) : Promise<string>;
    setValue(key: string, value: string) : Promise<void>;
    setValueEx(key: string, value: string, seconds: number) : Promise<void>;
    increment(key: string) : Promise<number>;
    delete(key: string) : Promise<boolean>;
    sadd(key: string, value: string) : Promise<number>;
    smember(key: string, member: string) : Promise<string|null>
    smembers(key: string) : Promise<string[]>;
    srem(key: string, member: string) : Promise<boolean>;
}