import * as winston from "winston";
import { lstat, mkdir, rm, rmdir, stat, writeFile } from "fs";

export class FileUtils {

    public static updateFile(path: string, content: string) {
        return new Promise<void>((resolve, reject) => {
            writeFile(path, content, (err) => {
                if (!err) {
                    resolve();
                } else {
                    winston.error("FileUtils.updateFile - Internal error during writeFile of " + path, err);
                    reject(err);
                }
            });
        });
    }

    public static updateFolder(path: string) {
        return new Promise<void>((resolve, reject) => {
            try {
                stat(path, async (err, stat) => {
                    if (!err) {
                        if (!stat.isDirectory()) {
                            await FileUtils.createFolder(path);
                            resolve();
                        } else {
                            resolve();
                        }
                    } else {
                        await FileUtils.createFolder(path);
                        resolve();
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    private static createFolder(path: string){
        return new Promise<void>((resolve, reject) => {
            mkdir(path, (err) => {
                if (!err) {
                    resolve();
                } else {
                    winston.error("FileUtils.createFolder - Internal error during mkdir of " + path, err)
                    reject(err);
                }
            });
        });
    }

    public static deleteFolder(path: string) {
        return new Promise<void>((resolve, reject) => {
            rm(path, {recursive: true}, (err) => {
                if (!err) {
                    resolve();
                } else {
                    winston.error("FileUtils.deleteFolder - Internal error during folder deletion: " + path, err);
                    reject(err);
                }
            });
        });
    }

    public static isFolderExists(path: string) {
        return new Promise<boolean>((resolve) => {
            lstat(path, (err, stat) => {
                if (!err) {
                    resolve(stat.isDirectory())
                } else {
                    resolve(false);
                }
            });
        });
    }
}