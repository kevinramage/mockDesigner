export class FunctionManager {
    registerFunction(libName: string, workspace?: string) : Promise<void>;
    functions : {[name: string]: Function};
}