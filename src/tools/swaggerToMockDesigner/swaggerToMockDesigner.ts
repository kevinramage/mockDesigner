import { program } from "commander";
import { Generator } from "./generator";

export class SwaggerToMockDesigner {

    public async run() {

        const generator = new Generator();
        var errorMessage = "";

        // Configure program
        program
            .option('-n, --name <projectName>', 'project name', '')
            .option('-i, --input <fileName>', 'input file name', '')
            .option('-o, --output <directoryName>', 'output directory name', '')
            .option('-m, --microservice', 'declare microservice swagger', '');
        
        program.description("Tool to generate mock description from a swagger");
        program.version("1.0.1");
        program.parse(process.argv);

        // Help
        program.option('-h, --help', 'help').action(() => {
            console.info(program.usage());
            process.exit(0);
        });

        // Check the name argument presence
        if ( program.name ) {
            generator.name = program.name.toString();
        } else {
            errorMessage += "Name argument not found\n";
        }

        // Check the input argument presence
        if ( program.input ) {
            generator.inputFile = program.input;
        } else {
            errorMessage += "Input argument not found\n";
        }

        // Output directory
        if ( program.output ) {
            generator.outputDirectory = program.output;
        } else {
            generator.outputDirectory = "mockGenerated";
        }

        // Run generator process
        if ( errorMessage == "" ) {
            console.info("INFO: Start generation ...");
            console.info("INFO: - Name: " + generator.name);
            console.info("INFO: - Input: " + generator.inputFile);
            console.info("INFO: - Output: " + generator.outputDirectory);
            console.info("");
            generator.run();
            console.info("INFO: Complete");
        } else {
            console.error('\x1b[31m', "ERROR: " + errorMessage);
        }

        // Reset color
        console.info('\x1b[0m', '');
    }


}

new SwaggerToMockDesigner().run();