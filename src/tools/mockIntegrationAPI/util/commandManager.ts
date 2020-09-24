import * as winston from "winston";
import { exec } from "child_process";
import { ExecutionError } from "./executionError";

export class CommandManager {

    public static execute(cmdLine: string, workspace: string, ignoreStderr: boolean = false) {
        winston.debug("CommandManager.execute: " + cmdLine);
        return new Promise<string>((resolve, reject) => {
            exec(cmdLine, {cwd: workspace}, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                if (stderr) {
                    if ( ignoreStderr ) {
                       resolve();
                    } else {
                        winston.debug("CommandManager.execute - Error");
                        reject(new ExecutionError(stderr)); 
                    }
                }
                resolve(stdout);
            });
        });
    }
}