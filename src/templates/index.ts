import * as winston from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");
import app from "./app";
import { RedisManager } from "./redisManager";

export class Main {

    public run() {

        // Configure logs
        winston.add(new DailyRotateFile({ filename: "logs/WASP_%DATE%.log", datePattern: 'YYYY-MM-DD', 
            level: 'debug', zippedArchive: true, maxSize: '20m', maxFiles: '14d'}));
        winston.add(new winston.transports.Console({ level: "debug",  }));

        // Redis manager
        RedisManager.instance.init();

        // Listen
        const port = Number.parseInt("{{.port}}");
        app.listen(port,() => {
            winston.info("The {{.name}} server started on " + port);
        });
    }
}

new Main().run();