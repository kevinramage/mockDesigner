import { METHODS } from "../business/utils/enum";
import { Router } from "express";
import { OptionsManager } from "../business/core/optionsManager";
import { MonitoringManager } from "../business/core/monitoringManager";

import * as express from "express";
import * as winston from "winston";

class DefaultRoute {
    public router: Router;
    public listeners: string[];

    public constructor() {
      this.router = Router();
      this.listeners = [];
    }

    public addRoute(path: string, method: string, handler: ((req: any, res: any, next: any) => void )) {
        switch (method) {
            case METHODS.GET:
                this.addGETRoute(path, handler);
            break;

            case METHODS.POST:
                this.addPOSTRoute(path, handler);
            break;

            case METHODS.PUT:
                this.addPUTRoute(path, handler);
            break;

            case METHODS.DELETE:
                this.addDELETERoute(path, handler);
            break;
        } 
    }

    private addGETRoute(path: string, handler: ((req: any, res: any, next: any) => void )) {
        this.router.get(path, handler);
    }

    private addPOSTRoute(path: string, handler: ((req: any, res: any, next: any) => void )) {
        this.router.post(path, handler);
    }

    private addPUTRoute(path: string, handler: ((req: any, res: any, next: any) => void )) {
        this.router.put(path, handler);
    }

    private addDELETERoute(path: string, handler: ((req: any, res: any, next: any) => void )) {
        this.router.delete(path, handler);
    }

    public middleware(req: express.Request, res: express.Response, next: Function) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        // Save the request
        if (!req.path.startsWith("/mockdesigner/")) {
            MonitoringManager.instance.saveRequest(req);
        }

        next();
    }

    public sendMethodNotAllow(req: express.Request, res: express.Response, next: Function) {
        if (!OptionsManager.instance.authorizedMethods.includes(req.method.toUpperCase())) {

            // Manage error handling
            res.status(405);
            const data : any = { code: 405, message: "Method not allowed" };

            // Add debug informations
            if (OptionsManager.instance.debug) {
                data.method = req.method;
                data.autorizedMethods = OptionsManager.instance.authorizedMethods;
                data.version = "Mock Designer v" + OptionsManager.instance.version;
            }
            
            // Send response
            const message = JSON.stringify(data);
            res.setHeader("Content-Type", "application/json");
            res.send(message);
            res.end();

            // Save response
            const headers = { ["Content-Type"]: "application/json" };
            MonitoringManager.instance.saveResponse(405, headers, message, res);

        } else {
            next();
        }
    }

    public sendResourceNotFound(req: express.Request, res: express.Response, next: Function) {

        // Manage error handling
        res.status(404);
        const data : any = { code: 404, message: "Ressource not found" };

        // Add debug informations
        if (OptionsManager.instance.debug) {
            data.requestPath = req.path;
            data.listenersRegistered = this.listeners;
            data.version = "Mock Designer v" + OptionsManager.instance.version;
        }
        
        // Send response
        const message = JSON.stringify(data);
        res.setHeader("Content-Type", "application/json");
        res.send(message);
        res.end();

        // Save response
        const headers = { ["Content-Type"]: "application/json" };
        MonitoringManager.instance.saveResponse(404, headers, message, res);
    }

    public sendInternalError(err: Error, req: express.Request, res: express.Response, next: Function) {

        // Error handling
        res.status(500);
        const data : any = { code: 500, message: "Internal error: " + err.message || "" };

        // Add debug informations
        if (OptionsManager.instance.debug) {
            data.stack = err.stack;
            data.version = "Mock Designer v" + OptionsManager.instance.version;
        }

        // Log informations
        winston.error("App.run - Internal error occured: " + err.message);
        winston.error(err.stack);

        // Send response
        res.setHeader("Content-Type", "application/json");
        res.send(data);
        res.end();

        // Save response
        const headers = { ["Content-Type"]: "application/json" };
        MonitoringManager.instance.saveResponse(500, headers, data, res);
    }

    public getRequests(req: any, res: any, next: any) {
        const filterKey = req.query.filterKey || "";
        const filterValue = req.query.filterValue || "";
        const limit = req.query.limit || 10;
        const requests = MonitoringManager.instance.getRequests(filterKey, filterValue, limit);
        const data : any = { code: 200, message: "Operation succeed", data: requests };
        res.status(200);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(data));
        res.end();
    }

    public getResponses(req: any, res: any, next: any) {
        const filterKey = req.query.filterKey || "";
        const filterValue = req.query.filterValue || "";
        const limit = req.query.limit || 10;
        const responses = MonitoringManager.instance.getResponses(filterKey, filterValue, limit);
        const data : any = { code: 200, message: "Operation succeed", data: responses };
        res.status(200);
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify(data));
        res.end();
    }
}
  
const defaultRoute = new DefaultRoute();
export default defaultRoute; 