import * as winston from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");
import app from "./app";
import { RedisManager } from "./manager/redisManager";
import { TemplateManager } from "./manager/templateManager";

export class Main {

    public run() {

        // Configure logs
        const myFormat = winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} - ${level.toUpperCase()}: ${message}`;
        });
        winston.add(new DailyRotateFile({ filename: "logs/WASP_%DATE%.log", datePattern: 'YYYY-MM-DD', 
            level: 'debug', zippedArchive: true, maxSize: '20m', maxFiles: '14d', format: winston.format.combine(winston.format.timestamp(), myFormat)}));
        winston.remove(winston.transports.Console);
        winston.add(new winston.transports.Console({level: "info", format: winston.format.combine(winston.format.timestamp(), myFormat) }));
        winston.info("Main.start - Begin");

        // Redis manager
        winston.info("Main.start - Start redis");
        RedisManager.instance.init();

        // Initialize template manager
        winston.info("Main.start - Initialize template manager");
        TemplateManager.instance.init();

        // Listen
        const port = Number.parseInt("{{.port}}");
        app.listen(port,() => {
            winston.info("Main.start - The {{.name}} server started on " + port);
        });
    }
}

new Main().run();