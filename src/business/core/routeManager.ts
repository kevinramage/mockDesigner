import { ResponseHandler } from "../utils/common";
import express, { Request, Response } from "express";
import { METHODS } from "../utils/enum";
import { Service } from "../project/service";
import { format } from "util";
import { BehaviourService } from "../services/behaviourService";
import { Context } from "./context";

export class RouteManager {
    private static _instance : RouteManager;
    private _app ?: express.Application;
    private _listeners : string[];

    private constructor() {
        this._listeners = [];
    }

    public init(app: express.Application) {
        this._app = app;
    }

    public addRoute(method: string, path: string, handler: ResponseHandler) {
        const methodUpperCase = method ? method.toUpperCase(): method;
        switch (methodUpperCase) {
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

            default:
                throw new Error("Invalid method");
        }
    }

    private addGETRoute(path: string, handler: ResponseHandler) {
        this.app.get(path, handler);
        this.switchNewRoute();
    }

    private addPOSTRoute(path: string, handler: ResponseHandler) {
        this.app.post(path, handler);
        this.switchNewRoute();
    }

    private addPUTRoute(path: string, handler: ResponseHandler) {
        this.app.put(path, handler);
        this.switchNewRoute();
    }

    private addDELETERoute(path: string, handler: ResponseHandler) {
        this.app.delete(path, handler);
        this.switchNewRoute();
    }

    private switchRoute(index1: number, index2: number) {
        const routes = this.app._router.stack;
        const swap = routes[index2];
        routes[index2] = routes[index1];
        routes[index1] = swap;
    }

    private identifyRoute(name: string) {
        const routes = this.app._router.stack;
        return routes.findIndex(r => { return r.name.includes(name); });
    }

    private switchNewRoute() {
        const routes = this.app._router.stack;
        const indexNewRoute = routes.length - 1;
        const indexInternalError = this.identifyRoute("sendInternalError");
        const indexResourceNotFound = this.identifyRoute("sendResourceNotFound");
        if ( indexInternalError != -1 && indexResourceNotFound != -1) {
            const minIndex = indexInternalError < indexResourceNotFound ? indexInternalError : indexResourceNotFound;
            this.switchRoute(indexNewRoute, minIndex);
        }
    }

    public addListener(service: Service){
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
        RouteManager.instance.addRoute(service.method, service.path, handler);
    }

    public removeListener(service: Service) {
        const routes = this.app._router.stack;
        let index = -1;
        for (var i = 0; i < routes.length; i++) {
            if (routes[i].route && routes[i].route.path == service.path && 
                (routes[i].route.methods.get && service.method == METHODS.GET || 
                routes[i].route.methods.post && service.method == METHODS.POST ||
                routes[i].route.methods.put && service.method == METHODS.PUT ||
                routes[i].route.methods.delete && service.method == METHODS.DELETE )) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            routes.splice(index, 1);
        }
    }

    private addBehaviours(service: Service) {
        const getBehavioursPath = format("%s/behaviours/:name", service.path);
        const getBehaviourPath = format("%s/behaviours/:name/:code", service.path);
        const createBehaviourPath = format("%s/behaviours", service.path);
        const deleteBehaviourPath = format("%s/behaviours/:name/:code", service.path);
        RouteManager.instance.addRoute(METHODS.GET, getBehaviourPath, BehaviourService.getBehaviour);
        RouteManager.instance.addRoute(METHODS.GET, getBehavioursPath, BehaviourService.getBehaviours);
        RouteManager.instance.addRoute(METHODS.POST, createBehaviourPath, BehaviourService.createBehaviour);
        RouteManager.instance.addRoute(METHODS.DELETE, deleteBehaviourPath, BehaviourService.deleteBehaviour);
    }

    public get app() {
        return this._app as express.Application;
    }

    public get listeners() {
        return this._listeners;
    }

    public static get instance() {
        if (!RouteManager._instance) {
            RouteManager._instance = new RouteManager();
        }
        return RouteManager._instance;
    }
}