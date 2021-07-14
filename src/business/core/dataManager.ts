import * as winston from "winston";
import { readdirSync, readFile } from "fs";
import { basename, join } from "path";
import { format } from "util";
import { OptionsManager } from "./optionsManager";

export class DataManager {
    private static _globalDataSources: {[name: string] : object} = {};
    private _dataSources: {[name: string] : object};

    constructor() {
        this._dataSources = {};
    }

    public static initializeGlobalFunctions() {
        return new Promise<void>(async (resolve) => {

            // Simple data source
            let path = join("default", "data", "simple");
            let files = readdirSync(path);
            for (var index in files) {
                const filePath = join(path, files[index]);
                const sourceName = basename(files[index], ".json");
                await this.registerDataSourceFromPath(sourceName, filePath, this._globalDataSources);
            }

            // Structured data source
            path = join("default", "data", "structured");
            files = readdirSync(path);
            for (var index in files) {
                const filePath = join(path, files[index]);
                const sourceName = basename(files[index], ".json");
                await this.registerDataSourceFromPath(sourceName, filePath, this._globalDataSources);
            }

            winston.info(format("DataManager.initializeGlobalFunctions - %d data source(s) loaded", Object.keys(this._globalDataSources).length));
            if (OptionsManager.instance.isDisplayDataSources) {
                console.info(Object.keys(this._globalDataSources).join(", "));
            }
            resolve();
        });
    }

    public init() {
        const keys = Object.keys(DataManager._globalDataSources);
        for (var index in keys) {
            const key = keys[index];
            this._dataSources[key] = DataManager._globalDataSources[key];
        }
    }

    public registerDataSource(dataSourceName: string, workspace: string) {
        return new  Promise<void>(async (resolve) => {
            const workspacePath = join(workspace, "data", dataSourceName + ".json");
            await DataManager.registerDataSourceFromPath(dataSourceName, workspacePath, this._dataSources);
            resolve();
        });
    }

    private static registerDataSourceFromPath(name: string, path: string,dataSources: {[key:string]: any}) {
        return new Promise<boolean>((resolve) => {
            readFile(path, (err, data) => {
                if (!err) {
                    try {
                        const objects = JSON.parse(data.toString());
                        dataSources[name] = objects;
                        resolve(true);
                    } catch (err){
                        winston.error("DataManager.registerDataSourceFromPath - Error during file parsing: ", err);
                        resolve(false);
                    }
                } else {
                    winston.error("DataManager.registerDataSourceFromPath - Error during file reading: ", err);
                    resolve(false);
                }
            });
        });
    }

    public get dataSources() {
        return this._dataSources;
    }
}