import { readdir, readFile } from "fs";
import { join } from "path";

export class FunctionManager {
    private _functions : {[name: string]: Function};

    constructor() {
        this._functions = {};
        this.init();
    }

    public init() {
        const path = join("default", "functions");
        readdir(path, (err, files) => {
            if (!err) {
                const jsFiles = files.filter(f => { return f.endsWith(".js"); });
                jsFiles.forEach(f => {
                    const lib = f.substr(0, f.length - (".js").length);
                    this.registerFunction(lib);
                });
                console.info(Object.keys(this.functions).join(","));
            }
        });
    }

    public registerFunction(libName: string, workspace?: string) {
        return new  Promise<void>(async (resolve) => {
            let registered = false;
            if (workspace) {
                const workspacePath = join(workspace, "functions", libName + ".js");
                registered = await this.registerFunctionFromPath(libName, workspacePath);
            }
            if (!registered) {
                const defaultPath = join("default", "functions", libName + ".js");
                this.registerFunctionFromPath(libName, defaultPath);
            }
            resolve();
        });
    }

    private registerFunctionFromPath(functionName: string, path: string) {
        return new Promise<boolean>((resolve) => {
            readFile(path, (err, data) => {
                if (!err) {
                    let content = data.toString();
                    content += "register(this.functions);";
                    eval(content);
                    resolve(true);
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