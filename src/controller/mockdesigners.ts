import * as winston from "winston";
import * as path from "path";
import * as fs from "fs";
import { MockProjectManagement } from "./mockProjectManagement";
import { MockDesigner } from "./mockdesigner";
import { KEYS, ERRORS } from "../constantes";
import { Mocks } from "../business/mocks";
import { Mock } from "../business/mock";
import { FileManagement } from "../utils/fileManagement";

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

        // Copy data
        FileManagement.copyDirectory("tests/responses", "generated/responses");
        FileManagement.copyDirectory("tests/data", "generated/data");
        FileManagement.copyDirectory("tests/scripts", "generated/scripts");
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
        this._mockProjectManagement.addTemplate("package.json", {key: KEYS.APPNAME, value: this._name.toLowerCase()});
        this._mockProjectManagement.addTemplate("tsconfig.json");
        this._mockProjectManagement.addTemplate("index.ts", {key: KEYS.APPNAME, value: this._name}, { key: KEYS.APPPORT, value: this._port + ""});
        this._mockProjectManagement.addTemplate("app.ts");
        this._mockProjectManagement.addTemplate("routes.ts");
        this._mockProjectManagement.addTemplate("redisManager.ts");
        this._mockProjectManagement.addTemplate("templateManager.ts");
        this._mockProjectManagement.addTemplate("context.ts");
        this._mockProjectManagement.addTemplate("authenticationManager.ts");
        this._mockProjectManagement.addTemplate("responseHandler.ts");
        this._mockProjectManagement.addTemplate("Dockerfile");
        this._mockProjectManagement.addTemplate("docker-compose.yml");
        this._mockProjectManagement.addTemplate("run.sh");
        this._mockProjectManagement.addTemplate("run.bat");
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