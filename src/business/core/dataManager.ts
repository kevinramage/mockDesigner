import { readFile } from "fs";
import { join } from "path";

export class DataManager {
    private _dataSources: {[name: string] : object};

    constructor() {
        this._dataSources = {};
        this.init();
    }

    public init() {
        this.registerDataSource("cityname");
        this.registerDataSource("firstname");
        this.registerDataSource("lastname");
        this.registerDataSource("words");
    }

    public registerDataSource(dataSourceName: string, workspace?: string) {
        return new  Promise<void>(async (resolve) => {
            let registered = false;
            if (workspace) {
                const workspacePath = join(workspace, "data", dataSourceName + ".json");
                registered = await this.registerDataSourceFromPath(dataSourceName, workspacePath);
            }
            if (!registered) {
                const defaultPath = join("default", "data", dataSourceName + ".json");
                this.registerDataSourceFromPath(dataSourceName, defaultPath);
            }
            resolve();
        });
    }

    private async registerDataSourceFromPath(name: string, path: string) {
        return new Promise<boolean>((resolve) => {
            readFile(path, (err, data) => {
                if (!err) {
                    try {
                        const objects = JSON.parse(data.toString());
                        this._dataSources[name] = objects;
                        resolve(true);
                    } catch {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            });
        });
    }

    public get dataSources() {
        return this._dataSources;
    }
}