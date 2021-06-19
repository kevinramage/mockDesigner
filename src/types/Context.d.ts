import { Request, Response } from "express";
import { DataManager } from "./DataManager";
import { FunctionManager } from "./FunctionManager";


export class Context {
    evaluateDataSource(dataSource: string, expression: string) : string;
    evaluateFunction(functionName: string, args: string[]) : Promise<string>;
    request : Request;
    response : Response;
    variables : {[key: string] : any};
    dataManager : DataManager;
    functionManager : FunctionManager;
}