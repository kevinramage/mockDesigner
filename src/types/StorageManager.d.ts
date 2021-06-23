export class StorageManager {
    getValue(key: string, member: string) : Promise<string>;
    storeValue(key: string, member: string, value: string) : Promise<boolean>;

    static get instance() : StorageManager;
}