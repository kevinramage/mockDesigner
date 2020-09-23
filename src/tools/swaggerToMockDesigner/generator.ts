import * as fs from "fs";
import * as path from "path";
import { parse } from "@apidevtools/swagger-parser";
import { OpenAPIV2 } from "openapi-types";
import { FileManagement } from "./utils/fileManagement";
import { Visitor } from "./visitor";
import { MockDesignerGenerator } from "./mockDesignerGenerator";

/**
 * Generate the source code from a swagger file
 * - Visite and read the swagger file
 * - Generate the code
 */
export class Generator {

    private _name : string;
    private _inputFile : string;
    private _outputDirectory : string;

    /**
     * Constructor
     */
    constructor() {
        this._name = "";
        this._inputFile = "";
        this._outputDirectory = "";
    }

    /**
     * Run the generator
     */
    public async run() {

        // Parse content
        const document = await this.parseContent();
        
        // Generate mock description
        const documentV2 = document as OpenAPIV2.Document;
        const services = new Visitor().visit(documentV2);

        // Generate output
        await this.generateDirectories();
        const files = new MockDesignerGenerator().generate(this.name, services);
        this.generateFiles(files);

        // Completed
        console.info("INFO - Completed");
    }

    /**
     * Create directories
     */
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

    /**
     * Create files
     * @param files files to generate
     */
    private generateFiles(files: {[id: string]: string}) {
        Object.keys(files).forEach(key => {
            const filePath = path.join(this.outputDirectory, key);
            fs.writeFileSync(filePath, files[key]);
        });
    }


    /**
     * Parse swagger file
     */
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