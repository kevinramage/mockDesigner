import * as fs from "fs";
import * as path from "path";
import * as rimraf from "rimraf";
import * as winston from "winston";

/**
 * Class to manage file and directory for the project
 */
export class FileManagement {

    /**
     * Create a directory in the project
     * If the directory already exists, clean it and remove it before creation
     * @param directoryName directory name to create
     */
    public static createDirectory(directoryName: string) {
        winston.debug("FileManagement.createDirectory: " + directoryName);
        return new Promise<void>((resolve) => {
            const directoryPath = path.join(process.cwd(), directoryName);
            if ( fs.existsSync(directoryPath) ) {
                rimraf.sync(directoryPath);

                // Delay the creation of new directory (500ms)
                // Else you encountered a permission denied error
                const callable = () => {
                    FileManagement.createDirectory(directoryName).finally(() => {
                        resolve();
                    });
                }
                setTimeout(callable, 500);
            } else {
                fs.mkdirSync(directoryPath);
                resolve();
            }
        });
    } 

    /**
     * Copy a directory content from a a directory source to a directory target name
     * If the target directory not exists, create it
     * @param source source directory name
     * @param target target directory name
     */
    public static copyDirectory (source: string, target: string) {
        const sourcePath = path.join(process.cwd(), source);
        const targetPath = path.join(process.cwd(), target);
        FileManagement._copyDirectory(sourcePath, targetPath);
    }

    /**
     * Copy a directory content from a a directory source to a directory target name
     * If the target directory not exists, create it
     * @param source source directory name
     * @param target target directory name
     */
    private static _copyDirectory (source: string, target: string) {

        // Security
        if ( !fs.existsSync(source) ) {
            return;
        }
        
        // Create target directory if not exists
        if ( !fs.existsSync(target) ) {
            fs.mkdirSync(target);
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

    /**
     * Read directory reccursively and return all files
     * @param source directory source name
     */
    public static readDirectoryReccursively(source: string) {
        return FileManagement._readDirectoryReccursively(source);
    }

    /**
     * Read directory reccursively and return all files
     * @param source directory source name
     */
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