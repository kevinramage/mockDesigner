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
import { METHODS } from "./business/utils/enum";
import { BehaviourService } from "./behaviourService";
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
        this.addBehaviours(service);
    }

    private addBehaviours(service: Service) {
        const getBehavioursPath = format("%s/behaviours/:name", service.path);
        const getBehaviourPath = format("%s/behaviours/:name/:code", service.path);
        const createBehaviourPath = format("%s/behaviours", service.path);
        const deleteBehaviourPath = format("%s/behaviours/:name/:code", service.path);
        DefaultRoute.addRoute(getBehaviourPath, METHODS.GET, BehaviourService.getBehaviour);
        DefaultRoute.addRoute(getBehavioursPath, METHODS.GET, BehaviourService.getBehaviours);
        DefaultRoute.addRoute(createBehaviourPath, METHODS.POST, BehaviourService.createBehaviour);
        DefaultRoute.addRoute(deleteBehaviourPath, METHODS.DELETE, BehaviourService.deleteBehaviour);
    }
}

export default new App().app;