import express from "express";
import * as winston from "winston";
import morgan from "morgan";
import { Projects } from "./business/project/projects";
import DefaultRoute from "./routes";
import { Project } from "./business/project/project";
import { format } from "util";
import { METHODS } from "./business/utils/enum";
import { OptionsManager } from "./business/core/optionsManager";
import { ProjectService } from "./business/services/project";
import { OptionService } from "./business/services/options";
import { RouteManager } from "./business/core/routeManager";
import { ServiceWrapper } from "./business/services/service";
import { TriggerService } from "./business/services/trigger";
import { ActionService } from "./business/services/actionService";
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

        // Init route manager
        RouteManager.instance.init(this.app);

        // Middleware
        this.app.use(DefaultRoute.middleware);
        this.app.use(DefaultRoute.sendMethodNotAllow);

        // Add project listeners
        const projects = await this.readProjects();
        this.addListeners(projects);
        this.app.use("/", DefaultRoute.router);

        // Monitoring
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/monitoring/requests", DefaultRoute.getRequests);
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/monitoring/responses", DefaultRoute.getResponses);

        //// API

        // Project
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/api/project/:pjname", ProjectService.getProject);
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/api/project", ProjectService.getAllProjects);
        RouteManager.instance.addRoute(METHODS.POST, "/mockdesigner/api/project", ProjectService.createProject);
        RouteManager.instance.addRoute(METHODS.DELETE, "/mockdesigner/api/project/:pjname", ProjectService.deleteProject);
        
        // Service
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/api/project/:pjname/service/:svcname", ServiceWrapper.getService);
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/api/project/:pjname/service", ServiceWrapper.getAllServices);
        RouteManager.instance.addRoute(METHODS.POST, "/mockdesigner/api/project/:pjname/service", ServiceWrapper.createService);
        RouteManager.instance.addRoute(METHODS.DELETE, "/mockdesigner/api/project/:pjname/service/:svcname", ServiceWrapper.deleteService);
        
        // Trigger
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/api/project/:pjname/service/:svcname/trigger/:trgid", TriggerService.getTrigger);
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/api/project/:pjname/service/:svcname/trigger", TriggerService.getAllTriggers);
        RouteManager.instance.addRoute(METHODS.POST, "/mockdesigner/api/project/:pjname/service/:svcname/trigger", TriggerService.createTrigger);
        RouteManager.instance.addRoute(METHODS.DELETE, "/mockdesigner/api/project/:pjname/service/:svcname/trigger/:trgid", TriggerService.deleteTrigger);
        
        // Action
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/api/project/:pjname/service/:svcname/trigger/:trgid/action/:actid", ActionService.getAction);
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/api/project/:pjname/service/:svcname/trigger/:trgid/action", ActionService.getAllActions);
        RouteManager.instance.addRoute(METHODS.POST, "/mockdesigner/api/project/:pjname/service/:svcname/trigger/:trgid/action", ActionService.createAction);
        RouteManager.instance.addRoute(METHODS.DELETE, "/mockdesigner/api/project/:pjname/service/:svcname/trigger/:trgid/action/:actid", ActionService.deleteAction);

        // Options
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/api/option/:key", OptionService.getAllOptions);
        RouteManager.instance.addRoute(METHODS.GET, "/mockdesigner/api/option", OptionService.getAllOptions);
        RouteManager.instance.addRoute(METHODS.POST, "/mockdesigner/api/option/reset", OptionService.resetOption);
        RouteManager.instance.addRoute(METHODS.PUT, "/mockdesigner/api/option", OptionService.updateOption);

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
                RouteManager.instance.addListener(services[keyService]);
            }
        }
        DefaultRoute.listeners = RouteManager.instance.listeners;
        if (OptionsManager.instance.isDisplayListeners) {
            console.info("Listeners:");
            console.info(RouteManager.instance.listeners);
        }
    }
}

export default new App().app;