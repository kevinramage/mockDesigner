import * as winston from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");
import app from "./app";

export class Main {

    public run() {

        // Configure logs
        const myFormat = winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} - ${level.toUpperCase()}: ${message}`;
        });
        winston.add(new DailyRotateFile({ filename: "logs/MockDesigner_%DATE%.log", datePattern: 'YYYY-MM-DD', 
            level: 'debug', zippedArchive: true, maxSize: '20m', maxFiles: '14d', format: winston.format.combine(winston.format.timestamp(), myFormat)}));
        winston.remove(winston.transports.Console);
        winston.add(new winston.transports.Console({level: "debug", format: winston.format.combine(winston.format.timestamp(), myFormat) }));
        winston.info("Main.start - Begin");

        process.on("uncaughtException", (err) => {
            winston.error("Main.start - Mock server crashed");
            winston.error(err.stack);
        });

        // Listen
        const port = process.env.PORT || 7001;
        app.listen(port,() => {
            winston.info("Main.start - Mock server started on " + port);
        });
    }
}

new Main().run();