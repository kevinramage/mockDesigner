import * as redis from "redis";

export class RedisManager {
    private static _instance : RedisManager;
    private _client : redis.RedisClient | undefined;

    public init() {
        this._client = redis.createClient();
    }

    public getValue(key: string) {
        return new Promise<string>((resolve, reject) => {
            if ( this._client ) {
                this._client.get(key, (err, value) => {
                    if ( !err ) {
                        resolve(value);
                    } else {
                        reject(err);
                    }
                });
            } else {
                reject("Client null or undefined");
            }
        });
    }

    public setValue(key: string, value: string) {
        if ( this._client ) {
            this._client.set(key, value);
        }
    }

    public static get instance() {
        if ( !RedisManager._instance ) {
            RedisManager._instance = new RedisManager();
        }
        return RedisManager._instance;
    }
}