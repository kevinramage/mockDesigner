import { readdir, readFile } from "fs";
import { join } from "path";
import * as winston from "winston";
import { OptionsManager } from "./optionsManager";

export class FunctionManager {
    private _functions : {[name: string]: Function};

    constructor() {
        this._functions = {};
        this.init();
    }

    public displayFunctions() {
    }

    private init() {
        return new Promise<void>((resolve, reject) => {
            const path = join("default", "functions");
            readdir(path, async(err, files) => {
                if (!err) {
                    const jsFiles = files.filter(f => { return f.endsWith(".js"); });
                    for (var key in jsFiles) {
                        try {
                            const file = jsFiles[key];
                            const lib = file.substr(0, file.length - (".js").length);
                            await this.registerFunction(lib);
                        } catch {}
                    }
                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    }

    public registerFunction(libName: string, workspace?: string) {
        return new  Promise<void>(async (resolve, reject) => {
            try {
                let registered = false;
                if (workspace) {
                    const workspacePath = join(workspace, "functions", libName + ".js");
                    registered = await this.registerFunctionFromPath(libName, workspacePath);
                }
                if (!registered) {
                    const defaultPath = join("default", "functions", libName + ".js");
                    await this.registerFunctionFromPath(libName, defaultPath);
                }
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    private registerFunctionFromPath(functionName: string, path: string) {
        return new Promise<boolean>((resolve, reject) => {
            readFile(path, (err, data) => {
                if (!err) {
                    try {
                        let content = data.toString();
                        content += "register(this.functions);";
                        eval(content);
                        resolve(true);
                    } catch (err) {
                        winston.error("FunctionManager.registerFunctionFromPath - Internal error: ", err);
                        reject(err);
                    }
                } else {
                    resolve(false);
                }
            });
        });
    }

    public get functions() {
        return this._functions;
    }
}