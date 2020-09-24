import errorHandler from "errorhandler";
import express from "express";
import morgan from "morgan";
import DefaultRoute from "./routes";
const bodyParser = require('body-parser');

export class App {

    public app : express.Application;

    constructor() {
        this.app = express();
        this.run();
    }

    public run() {

        // Configure express
        this.app.set("port", process.env.PORT || 8000);
        this.app.use(morgan("dev"));
        this.app.use(bodyParser.json());
        this.app.use(errorHandler());
        this.app.use("/", DefaultRoute);
    }
}

export default new App().app;