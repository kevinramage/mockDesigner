import * as winston from "winston";
import * as path from "path";
import * as fs from "fs";
import * as util from "util";
import { exec } from "child_process";
import { MockProjectManagement } from "./mockProjectManagement";
import { MockDesigner } from "./mockdesigner";
import { KEYS, ERRORS } from "../constantes";
import { Mocks } from "../business/mocks";
import { Mock } from "../business/mock";
import { FileManagement } from "../utils/fileManagement";
import { IKeyValue } from "../interface/keyValue";

export class MockDesigners {

    private _mockProjectManagement : MockProjectManagement;
    private _mocks : Mocks;
    private _name : string = "MyMockApp";
    private _port : number = 7001;
    private _inputDir : string = "";
    private _outputDir : string = "generated";

    constructor() {
        this._mockProjectManagement = new MockProjectManagement();
        this._mocks = new Mocks();
    }

    private readFiles(input: string) : string[] {
        winston.debug("MockDesigners.readFiles");
        const dirname = path.dirname(input);
        var expression = path.basename(input);

        // Update expression
        if ( expression.includes("*")) {
            expression = expression.replace(/\*/g, ".*");
            if ( !expression.endsWith("$")) {
                expression = expression + "$"
            }
        }

        // Test the regex
        try {
            new RegExp(expression);
        } catch ( err ) {
            throw new Error(ERRORS.INVALID_INPUTDIREXPRESSION);
        }

        // Collect directory data
        if ( fs.existsSync(dirname) ) {
            try {
                const files = fs.readdirSync(dirname).filter(fileName => {
                    if ( expression.includes("*")) {
                        const regex = new RegExp(expression);
                        return regex.exec(fileName) != null;
                    } else {
                        return fileName == expression;
                    }
                });
                return files.map(f => { return dirname + "/" + f; });
            } catch (err) {
                winston.error("MockDesigners.readFiles - An error occured during the files reading: ", err);
                throw new Error(ERRORS.FAIL_READDIR);
            }
        } else {
            throw new Error(ERRORS.INVALID_INPUTDIR);
        }
    }

    private readMocks(files: string[]) {
        winston.debug("MockDesigners.readMocks");
        const instance = this;
        files.forEach(file => {
            const mockDesigner = new MockDesigner();
            mockDesigner.read(file);
            instance._mocks.addMock(mockDesigner.mock as Mock);
        });
    }
    
    public run() : void {
        winston.debug("MockDesigners.run");

        // Copy data
        FileManagement.createDirectory("generated");
        FileManagement.copyDirectory("tests/code", "generated/code");
        FileManagement.copyDirectory("tests/data", "generated/data");
        FileManagement.copyDirectory("tests/functions", "generated/functions");
        FileManagement.copyDirectory("tests/responses", "generated/responses");
        FileManagement.copyDirectory("tests/scripts", "generated/scripts");

        // Read files
        const files = this.readFiles(this.inputDir);
        if ( files.length == 0 ) {
            throw new Error(ERRORS.INVALID_INPUTDIR_NOFILES);
        }
        this.readMocks(files);

        // Generate files
        this.generateFiles();

        // Write files
        this._mockProjectManagement.writeFiles("generated");
    }

    private generateFiles() {
        winston.debug("MockDesigners.run");

        // Generate main files
        this.addProjectFiles();

        // Generate files from mock file
        this._mocks.generate(this._mockProjectManagement);
    }

    private addProjectFiles() {
        winston.debug("MockDesigners.addProjectFiles");

        // Variables
        const variables : {[key: string] : IKeyValue[]} = {};
        variables["package.json"] = [{key: KEYS.APPNAME, value: this._name.toLowerCase()}];
        variables["index.ts"] = [{key: KEYS.APPNAME, value: this._name}, { key: KEYS.APPPORT, value: this._port + ""}];
        
        // Update template code
        const data = this.importExternalsFunctions();
        variables["manager/templateManager.ts"] = [ 
            { key: KEYS.IMPORTS, value: data.imports.join(" ") },
            { key: KEYS.REGISTER, value: data.codes.join("\n") }
        ];

        // Read all files present in templates directory
        const instance = this;
        FileManagement.readDirectoryReccursively("templates").forEach(file => {
            var fileName = file.substring(("generated/").length);
            fileName = fileName.replace("\\", "/");
            if ( variables[fileName] ) {
                var args : [string, ...IKeyValue[]] = [fileName];
                variables[fileName].forEach(conf => {
                    args.push(conf);
                });
                instance._mockProjectManagement.addTemplate.apply(instance._mockProjectManagement, args);
            } else {
              instance._mockProjectManagement.addTemplate(fileName);
            }
        });
    }

    private importExternalsFunctions() {
        winston.debug("MockDesigners.importExternalsFunctions");
        const codes : string[] = [];
        const imports : string[] = [];
        FileManagement.readDirectoryReccursively("tests/functions").forEach(file => {
            var pathname = file.replace(/\\/g, "/").substring(("tests/functions/").length);
            pathname = pathname.substring(0, pathname.length - 3);
            const className = path.basename(file, ".ts");
            const anImport = util.format("import { %s } from \"../functions/%s\";", className, pathname);
            imports.push(anImport);
            const code = util.format("%s.functions.forEach(f => { instance._functions[f.name] = f.func });", className);
            codes.push(code);
        });
        return { codes: codes, imports: imports };
    }

    private compileExternalFunctions() {
        const fileNames : string[]= [];
        fs.readdirSync("functions").forEach(file => {
            // Add file
            const fileName = path.join("functions", file);
            fileNames.push(fileName);

            // Change imports
        });

        // Compile
        /*
        const instance = this;
        const tscCmdLine = "tsc -t es6 -m commonjs --esModuleInterop";
        const cmdLine = fileNames.map(file => { return util.format("%s %s",tscCmdLine ,file); }).join(";");
        console.info(cmdLine);
        exec(cmdLine, (err, stdout, stderr) => {
            console.info(err);
            console.info(stderr);
            //instance.includeExternalFunctions(fileNames);
        });
        */
    }

    public get name() {
        return this._name;
    }
    public set name(value) {
        this._name = value;
    }

    public get port() {
        return this._port;
    }
    public set port(value) {
        this._port = value;
    }

    public get inputDir() {
        return this._inputDir;
    }
    public set inputDir(value) {
        this._inputDir = value;
    }

    public get outputDir() {
        return this._outputDir;
    }
    public set outputDir(value) {
        this._outputDir = value;
    }
}