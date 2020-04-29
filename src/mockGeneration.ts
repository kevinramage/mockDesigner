import { MockDesigners } from "./controller/mockdesigners";
import * as winston from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");
import { program } from "commander";
import { ERRORS } from "./constantes";

export class Main {

    public async run() {

        // Configure logs
        winston.add(new DailyRotateFile({ filename: "logs/WASP_%DATE%.log", datePattern: 'YYYY-MM-DD', 
            level: 'debug', zippedArchive: true, maxSize: '20m', maxFiles: '14d'}));
        winston.add(new winston.transports.Console({ level: "info",  }));

        // Configure program
        program
            .option('-n, --projectName', 'project name')
            .option('-i, --input', 'input directory')
            .option('-o, --output', 'output directory')
            .option('-p, --port', 'mock port')
        
        program.description("Tool to generate mocks from descriptions");
        program.version("1.0.0");
        program.parse(process.argv);

        // Help
        program.option('-h, --help', 'help').action(() => {
            console.info(program.usage());
            process.exit(0);
        });

        // Run mock designers
        var error = "";
        var argIndex = 0;
        const mockDesigners = new MockDesigners();

        // Project name
        if ( program.projetName ) {
            const regex = /^[a-zA-Z0-9_\s]+$/g;
            const projetName = program.args[argIndex++];
            if ( regex.exec(projetName)) {
                console.info(projetName);
                mockDesigners.name = projetName;
            } else {
                error = ERRORS.INVALID_PROJECTNAME;
            }
        }

        // Port
        if ( program.port ) {
            const port = Number.parseInt(program.args[argIndex++]);
            if ( isNaN(port) && port > 0 ) {
                mockDesigners.port = port;
            } else {
                error = ERRORS.INVALID_PORT;
            }
        }

        // InputDir
        if ( program.input ) {
            mockDesigners.inputDir = program.args[argIndex++];
        }

        // Output
        if ( program.output ) {
            mockDesigners.outputDir = program.args[argIndex++];
        }

        console.info("INFO  - MockDesigner - Start");
        if ( error == "" ) {
            try {

                // Run the generation
                mockDesigners.run();

                console.info("INFO  - MockDesigner - Complete");
            } catch ( ex ) {
                //winston.error("An error occured during the process: ", ex);
                const errorMessage = ex.message as string;
                if ( errorMessage.includes('\n')) {
                    errorMessage.split('\n').forEach(message => {
                        console.error("ERROR - " + message);
                    });
                } else {
                    console.error("ERROR - " + ex.message);
                }
            }
        } else {
            console.error("ERROR - " + error);
        }
    }
}

new Main().run();