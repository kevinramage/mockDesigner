//import * as bodyParser from "body-parser";
import errorHandler from "errorhandler";
import express from "express";
import morgan from "morgan";
import DefaultRoute from "./routes";
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);

export class App {

    public app : express.Application;

    constructor() {
        this.app = express();
        this.run();
    }

    public run() {

        // Configure express
        this.app.set("port", process.env.PORT || 7001);
        this.app.use(morgan("dev"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.xml());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(errorHandler());
        this.app.use("/", DefaultRoute);
    }
}

export default new App().app;