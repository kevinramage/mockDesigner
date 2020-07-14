import * as fs from "fs";
import * as path from "path";
import * as winston from "winston";
import * as util from "util";
import { ERRORS } from "../constantes";
import { IKeyValue } from "interface/keyValue";

export class MockProjectManagement {
    private _files : { [id: string] : string };

    constructor() {
        this._files = {};
    }

    public createFile(fileName: string, body: string) {
        winston.debug(util.format("MockProjectManagement.writeFile: %s", fileName));
        this._files[fileName] = body;
    }

    public copyFile(source: string, target: string) {
        winston.debug(util.format("MockProjectManagement.copyFile: %s to %s", source, target));
        var code = null;
        try {
            code = fs.readFileSync(source).toString();
        } catch (ex) {
            winston.error("MockProjectManagement.copyFile - Internal error during copy: ", ex);
        }
        if ( code ) {
            this._files[target] = code;
        } else {
            this._files[target] = "";
        }
    }

    public updateFile(fileName: string, key: string, code: string) {
        winston.debug(util.format("MockProjectManagement.updateFile: %s on %s", key,fileName));
        if ( this._files[fileName] ) {
            this._files[fileName] = this._files[fileName].replace(key, code);
        } else {
            throw ERRORS.FILE_UPDATE;
        }
    }

    public addTemplate(templateName: string, ...values : IKeyValue[]) {
        winston.debug(util.format("MockProjectManagement.addTemplate: %s", templateName));
        const templatePath = path.join(process.cwd(), "templates", templateName);
        const body = fs.readFileSync(templatePath);
        this._files[templateName] = body.toString();
        const instance = this;
        values.forEach(value => {
            instance._files[templateName] = instance._files[templateName].replace(value.key, value.value);
        });
    }

    public writeFiles(outputPathname: string) {
        winston.debug(util.format("MockProjectManagement.writeFiles: %s", outputPathname));        

        // Write all files
        const instance = this;
        Object.keys(this._files).forEach(key => {
            const pathname = path.join(process.cwd(), outputPathname, key);
            instance.writeFile(pathname, instance._files[key]);
        });
    }

    private writeFile(pathname: string, body: string) {
        winston.debug(util.format("MockProjectManagement.writeFile: %s", pathname));

        // Create directory
        const directoryPath = path.dirname(pathname);
        if ( !fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        // Create file
        fs.writeFileSync(pathname, body);
    }
}