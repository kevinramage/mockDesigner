import * as fs from "fs";
import * as path from "path";

export class FileManagement {

    public static copyDirectory (source: string, target: string) {

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
                FileManagement.copyDirectory(sourceFile, targetFile);

            // File
            } else {
                fs.copyFileSync(sourceFile, targetFile);
            }
        });
    }

    public static readDirectoryReccursively(source: string) {
        var files : string[] = [];

        fs.readdirSync(source).forEach(file => {
            const fileName = path.join(source, file);
            if ( fs.lstatSync(fileName).isDirectory() ) {
                const subFiles = FileManagement.readDirectoryReccursively(fileName);
                files = files.concat(subFiles);
            } else {
                files.push(fileName);
            }
        });

        return files;
    }
}