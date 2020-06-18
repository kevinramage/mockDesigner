import { program } from "commander";
import { Generator } from "./generator";

export class SwaggerToMockDesigner {

    public async run() {

        // Configure program
        program
            .option('-n, --name <projectName>', 'project name', '')
            .option('-i, --input <fileName>', 'input file name', '')
            .option('-o, --output <directoryName>', 'output directory name', '')
            .option('-m, --microservice', 'declare microservice swagger', '');
        
        program.description("Tool to generate mock description from a swagger");
        program.version("1.0.0");
        program.parse(process.argv);

        // Run generator process
        const generator = new Generator();
        generator.name = "myMockSystem";
        generator.inputFile = "swagger.json";
        //generator.inputFile = "openAPI3.0.yml";
        //generator.inputFile = "swagger2_example.yml";
        generator.outputDirectory = "mockGenerated";
        generator.run();
    }


}

new SwaggerToMockDesigner().run();