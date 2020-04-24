import { MockDesigners } from "./controller/mockdesigners";
import * as winston from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");

export class Main {

    public run() {

        // Configure logs
        winston.add(new DailyRotateFile({ filename: "logs/WASP_%DATE%.log", datePattern: 'YYYY-MM-DD', 
            level: 'debug', zippedArchive: true, maxSize: '20m', maxFiles: '14d'}));
        winston.add(new winston.transports.Console({ level: "info",  }));


        // Run mock designers
        const mockDesigners = new MockDesigners();
        mockDesigners.run();
    }
}

new Main().run();