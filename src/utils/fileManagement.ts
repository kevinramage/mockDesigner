import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
import * as winston from "winston";

export class FileManagement {

    public static createDirectory(directory: string) {
        winston.debug("FileManagement.createDirectory: " + directory);
        const directoryPath = path.join(process.cwd(), directory);
        if ( fs.existsSync(directoryPath) ) {
            rimraf.sync(directoryPath)
        }
        fs.mkdirSync(directoryPath, { mode: 777 });
    } 

    public static copyDirectory (source: string, target: string) {
        const sourcePath = path.join(process.cwd(), source);
        const targetPath = path.join(process.cwd(), target);
        FileManagement._copyDirectory(sourcePath, targetPath);
    }

    public static _copyDirectory (source: string, target: string) {

        // Security
        if ( !fs.existsSync(source) ) {
            return;
        }
        
        // Create target directory if not exists
        if ( !fs.existsSync(target) ) {
            fs.mkdirSync(target, { mode: 777});
        }

        // Copy files and subdirectory
        fs.readdirSync(source).forEach(file => {
            const sourceFile = path.join(source, file);
            const targetFile = path.join(target, file);

            // Directory
            if ( fs.statSync(sourceFile).isDirectory() ) {
                FileManagement._copyDirectory(sourceFile, targetFile);

            // File
            } else {
                fs.copyFileSync(sourceFile, targetFile);
            }
        });
    }

    public static readDirectoryReccursively(source: string) {
        const sourcePath = path.join(process.cwd(), source);
        return FileManagement._readDirectoryReccursively(source);
    }

    public static _readDirectoryReccursively(source: string) {
        var files : string[] = [];

        fs.readdirSync(source).forEach(file => {
            const fileName = path.join(source, file);
            if ( fs.lstatSync(fileName).isDirectory() ) {
                const subFiles = FileManagement._readDirectoryReccursively(fileName);
                files = files.concat(subFiles);
            } else {
                files.push(fileName);
            }
        });

        return files;
    }
}