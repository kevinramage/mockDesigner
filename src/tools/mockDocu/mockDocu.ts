import * as winston from "winston";
import * as path from "path";
import { program } from "commander";
import { Generator } from "./business/generator";

import DailyRotateFile = require("winston-daily-rotate-file");

export class MockDocu {

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
            .option('-i, --input <fileName>', 'input file name', '')
            .option('-o, --output <directoryName>', 'output directory name', '')
        
        program.description("Tool to generate mock ddocumentation");
        program.version("1.0.0");
        program.parse(process.argv);

        // Run generator process
        const fileName = path.basename(program.input, ".yml") + ".md";
        const generator = new Generator();
        generator.input = program.input;
        generator.output = path.join(program.output, fileName);
        winston.info("MockDocu - Start");
        winston.info("* Input: " + generator.input);
        winston.info("* Output:" + generator.output);
        generator.run();
    }
}

new MockDocu().run();