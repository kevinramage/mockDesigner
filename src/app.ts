import express, { Request, Response } from "express";
import * as winston from "winston";
import morgan from "morgan";
import { Projects } from "./business/project/projects";
import DefaultRoute from "./routes";
import { Project } from "./business/project/project";
import { Context } from "./business/core/context";
import { Service } from "./business/project/service";
import { format } from "util";
import { METHODS } from "./business/utils/enum";
import { BehaviourService } from "./behaviourService";
import { OptionsManager } from "./business/core/optionsManager";
import { ProjectService } from "./business/services/project";
import { OptionService } from "./business/services/options";
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);

export class App {

    public app : express.Application;
    private _listeners : string[];

    constructor() {
        this._listeners = [];
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

        // Middleware
        this.app.use(DefaultRoute.middleware);
        this.app.use(DefaultRoute.sendMethodNotAllow);

        // Add project listeners
        const projects = await this.readProjects();
        this.addListeners(projects);
        this.app.use("/", DefaultRoute.router);

        // Monitoring
        this.app.get("/mockdesigner/monitoring/requests", DefaultRoute.getRequests);
        this.app.get("/mockdesigner/monitoring/responses", DefaultRoute.getResponses);

        // API
        this.app.get("/mockdesigner/api/project/:pjname", ProjectService.getProject);
        this.app.get("/mockdesigner/api/project", ProjectService.getAllProjects);
        this.app.get("/mockdesigner/api/option/:key", OptionService.getAllOptions);
        this.app.get("/mockdesigner/api/option", OptionService.getAllOptions);
        this.app.put("/mockdesigner/api/option", OptionService.updateOption);
        this.app.post("/mockdesigner/api/option/reset", OptionService.resetOption);

        // Error handling
        this.app.use(DefaultRoute.sendResourceNotFound.bind(DefaultRoute));
        this.app.use(DefaultRoute.sendInternalError);
    }

    private readProjects() {
        return new Promise<Project[]>(async (resolve) => {
            const projects = await Projects.buildProjects(OptionsManager.instance.mockWorkingDirectory);
            winston.info(format("App.readProjects - %d project(s) loaded", projects.length));
            resolve(projects);
        });
    }

    private addListeners(projects: Project[]) {
        for (const key in projects) {
            const services = Object.values(projects[key].services);
            for (const keyService in services) {
                this.addListener(services[keyService]);
            }
        }
        DefaultRoute.listeners = this._listeners;
        if (OptionsManager.instance.isDisplayListeners) {
            console.info("Listeners:");
            console.info(this._listeners);
        }
    }

    private addListener(service: Service){
        this._listeners.push(format("%s %s", service.method, service.path));
        const handler = async(req : Request, res: Response, next: any) => {
            try {

                // Execute the service
                const context = new Context(req, res);
                await service.execute(context);

                // Execute the default response if no response provided by the system
                context.sendNoResponseMessage();

            } catch (err) {
                next(err);
            }
        };
        this.addBehaviours(service);
        DefaultRoute.addRoute(service.path, service.method, handler);
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