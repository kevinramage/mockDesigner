import * as fs from "fs";
import * as path from "path";
import { parse } from "@apidevtools/swagger-parser";
import { OpenAPIV2, OpenAPIV3 } from "openapi-types";
import { GeneratorOpenAPIV2 } from "./generatorOpenAPIV2";
import { GeneratorOpenAPIV3 } from "./generatorOpenAPIV3";
import { FileManagement } from "./utils/fileManagement";
import { Service } from "./business/service";

export class Generator {

    private _name : string;
    private _inputFile : string;
    private _outputDirectory : string;

    constructor() {
        this._name = "";
        this._inputFile = "";
        this._outputDirectory = "";
    }

    public async run() {

        // Parse content
        const document = await this.parseContent();
        
        // Generate mock description
        const generatorOpenAPIV2 = new GeneratorOpenAPIV2();
        var services : Service[] = [];
        const pathsOpenAPIV2 = document.paths as OpenAPIV2.PathsObject;
        if ( pathsOpenAPIV2 ) {
            const documentV2 = document as OpenAPIV2.Document;
            services = generatorOpenAPIV2.run(document.paths as OpenAPIV2.PathsObject, documentV2.definitions);
        } else {
            //new GeneratorOpenAPIV3().run(document.paths as OpenAPIV3.PathsObject);
        }

        // Generate output
        await this.generateDirectories();
        const files = generatorOpenAPIV2.generateMockDescription(this.name, services);
        this.generateFiles(files);

        // Completed
        console.info("INFO - Completed");
    }

    private async generateDirectories() {
        return new Promise<void>(async (resolve) => {
            console.info("Output: " + this.outputDirectory);
            await FileManagement.createDirectory(this.outputDirectory);
            fs.mkdirSync(path.join(this.outputDirectory, "code"));
            fs.mkdirSync(path.join(this.outputDirectory, "data"));
            fs.mkdirSync(path.join(this.outputDirectory, "functions"));
            fs.mkdirSync(path.join(this.outputDirectory, "responses"));
            fs.mkdirSync(path.join(this.outputDirectory, "scripts"));
            resolve();
        });
    }

    private generateFiles(files: {[id: string]: string}) {
        Object.keys(files).forEach(key => {
            const filePath = path.join(this.outputDirectory, key);
            fs.writeFileSync(filePath, files[key]);
        });
    }


    private parseContent() {
        return parse(this.inputFile);
    }

    public get name() {
        return this._name;
    }
    public set name(value) {
        this._name = value;
    }

    public get inputFile() {
        return this._inputFile;
    }
    public set inputFile(value) {
        this._inputFile = value;
    }
    public get outputDirectory() {
        return this._outputDirectory;
    }
    public set outputDirectory(value) {
        this._outputDirectory = value;
    }
}