import * as winston from "winston";
import * as colors from "colors";
import * as util from "util";
import * as path from "path";
import { MockDesigners } from "./controller/mockdesigners";
import { program } from "commander";
import { ERRORS } from "./constantes";
import { ValidationError } from "./controller/mockdesigner";
import { exec } from "child_process";

import DailyRotateFile = require("winston-daily-rotate-file");

export class Main {

    public async run() {

        // Configure logs
        const myFormat = winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} - ${level.toUpperCase()}: ${message}`;
        });
        winston.add(new DailyRotateFile({ filename: "logs/MockDesigner_%DATE%.log", datePattern: 'YYYY-MM-DD', 
            level: 'debug', zippedArchive: true, maxSize: '20m', maxFiles: '14d', format: winston.format.combine(winston.format.timestamp(), myFormat)}));
        winston.remove(winston.transports.Console);
        winston.add(new winston.transports.Console({level: "info", stderrLevels: ["error"], format: winston.format.combine(winston.format.timestamp(), myFormat) }));

        // Configure program
        program
            .option('-n, --projectName <name>', 'project name')
            .option('-i, --input <directory>', 'input directory')
            .option('-o, --output <directory>', 'output directory')
            .option('-p, --port <portNumber>', 'mock port')
            .option('-m, --modules <modulesName>', 'modules name (separated by semi colon)')
        
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
        const mockDesigners = new MockDesigners();

        // Project name
        if ( program.projetName ) {
            const regex = /^[a-zA-Z0-9_\s]+$/g;
            if ( regex.exec(program.projectName)) {
                mockDesigners.name = program.projectName;
            } else {
                error = ERRORS.INVALID_PROJECTNAME;
            }
        }

        // Port
        if ( program.port ) {
            const port = Number.parseInt(program.port);
            if ( !isNaN(port) && port > 0 ) {
                mockDesigners.port = port;
            } else {
                error = ERRORS.INVALID_PORT;
            }
        }

        // InputDir
        if ( program.input ) {
            mockDesigners.inputDir = program.input;
        }

        // Output
        if ( program.output ) {
            mockDesigners.outputDir = program.output;
        }

        winston.info("MockDesigner - Start");
        if ( error == "" ) {
            try {

                // Run the generation
                await mockDesigners.run();

                // Run modules
                if ( program.modules && program.modules != "" ) {
                    try {
                        await this.runModules(program.modules, program.input, program.output);
                    } catch ( ex ) {
                        winston.error("MockDesigner - Run modules - Internal error during module execution");
                        return;
                    }
                }

                winston.info("MockDesigner - Complete");
            } catch ( ex ) {
                const validationError = ex as ValidationError;
                if ( validationError ) {
                    console.error(colors.red("ERROR: " + validationError.message));
                    validationError.errors.forEach(err => {
                        console.error(colors.red("ERROR: " + err));
                    });
                } else {
                    console.error("ERROR - " + ex.message);
                    console.error(ex);
                }
                console.info("");
            }
        } else {
            console.error("ERROR - " + error);
        }
    }

    private async runModules(modulesName: string, input: string, output: string) {
        const instance = this;
        const modules = modulesName.split(";");
        const promises = modules.map(moduleName => {
            return instance.runModule(moduleName, input, output);
        });
        return Promise.all(promises);
    }

    private runModule(moduleName: string, input: string, output: string) {
        return new Promise<boolean>((resolve, reject) => {
            winston.info("MockDesigner - Run module: " + moduleName);
            var inputFile = path.join("..", "..", input);
            var outputFile = path.join("..", "..", output);
            var commandLine = util.format("npm start --prefix ./tools/%s -- --input %s --output %s", moduleName, inputFile, outputFile);
            winston.debug("MockDesigner - Run module ... " + commandLine);
            exec(commandLine, (error, stdout, stderr) => {
                winston.debug("MockDesigner - Run module: " + stdout);
                if ( error == null && stderr == "") {
                    resolve(true);
                } else if ( error ) {
                    winston.error(util.format("An error occured during the module '%s' execution", moduleName), error);
                    reject(error);
                } else {
                    winston.error(util.format("An error occured during the module '%s' execution: %s", moduleName, stderr), stderr);
                    reject(stderr);
                }
            });
        });
    }
}

new Main().run();