import { Projects } from "./business/project/projects";
import errorHandler from "errorhandler";
import express, { Request, Response } from "express";
import morgan from "morgan";
import DefaultRoute from "./routes";
import { Project } from "./business/project/project";
import { Context } from "./business/core/context";
import { Service } from "./business/project/service";
import * as winston from "winston";
import { format } from "util";
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);

export class App {

    public app : express.Application;

    constructor() {
        this.app = express();
        this.run();
    }

    public async run() {

        // Configure express
        this.app.set("port", process.env.PORT || 7001);
        this.app.use(morgan("dev"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.xml());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(errorHandler());
        this.app.use("/", DefaultRoute.router);

        // Read project
        const projects = await this.readProjects();
        this.addListeners(projects);
    }

    private readProjects() {
        return new Promise<Project[]>(async (resolve) => {
            const projects = await Projects.readProjects("mock");
            winston.info(format("App.readProjects - %d project(s) loaded", projects.length));
            resolve(projects);
        });
    }

    private addListeners(projects: Project[]) {
        projects.forEach((project) => {
            Object.values(project.services).forEach(service => {
                this.addListener(service);
            });
        });
    }

    private addListener(service: Service){
        winston.info(format("App.addListener - Add a listener for path %s %s", service.method, service.path));
        const handler = (req : Request, res: Response) => {
            const context = new Context(req, res);
            service.execute(context);
        };
        DefaultRoute.addRoute(service.path, service.method, handler);
    }
}

export default new App().app;