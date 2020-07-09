import * as winston from "winston";
import * as util from "util";

export class RouteSolver {
    private static _instance : RouteSolver;
    private _routes : Route[];

    constructor() {
        this._routes = [];
    }

    public addRoute(method: string, path: string, functionName: string) {
        winston.debug("RouteSolver.addRoute");
        const code = util.format("this.router.route(\"%s\").%s(%s);", path, method.toLowerCase(), functionName);
        this._routes.push(new Route(path, code));
    }

    public resolve() {
        winston.debug("RouteSolver.resolve");
        this.addDependencies();
        this.identifyOrder();
        return this._routes.sort((a: Route, b: Route) => {
            const orderA = a.order as number;
            const orderB = b.order as number;
            return orderA > orderB ? -1 : 1;
        });
    }

    private addDependencies() {
        winston.debug("RouteSolver.addDependencies");
        const instance = this;
        this._routes.forEach(r => {
            instance.addDependency(r);
        });
    }

    private addDependency(route: Route) {
        winston.debug("RouteSolver.addDependency");
        const otherRoutes = this.otherRoutes(route);
        otherRoutes.forEach(r => {
            if ( route.path.includes(r.path)) {
                route.addDependency(r);
            }
        });
    }

    private identifyOrder() {
        winston.debug("RouteSolver.identifyOrder");
        var order = 1, toProceed;
        var remaining = this._routes.filter(r => { return !r.order; });
        while ( remaining.length > 0 ) {
            toProceed = this.minDependencies(remaining);
            if ( toProceed ) {
                toProceed.order = order++;
                this.removeDependencies(toProceed);
                remaining = this._routes.filter(r => { return !r.order; });
            } else {
                break;
            }
        }
    }

    private minDependencies(items: Route[]) {
        winston.debug("RouteSolver.minDependencies");
        if ( items.length > 0 ) {
            var minDependency = items[0];
            var minDependencyLength = items[0].dependencies.length;
            for ( var i = 1; i < items.length; i++) {
                if ( items[i].dependencies.length < minDependencyLength ) {
                    minDependency = items[i];
                    minDependencyLength = minDependency.dependencies.length;
                }
            }
            return minDependency;
        } else {
            return null;
        }
    }

    private removeDependencies(dependency: Route) {
        winston.debug("RouteSolver.removeDependencies");
        const instance = this;
        this._routes.forEach(r => {
            instance.removeDependency(r, dependency);
        });
    }

    private removeDependency(route: Route, dependency: Route) {
        route.removeDependency(dependency);
    }

    public otherRoutes(currentRoute: Route) {
        return this._routes.filter(r => { return r.path != currentRoute.path; })
    }

    public static get instance() {
        if ( !RouteSolver._instance ) {
            RouteSolver._instance = new RouteSolver();
        }
        return RouteSolver._instance;
    }
}

class Route {
    private _id : string | undefined;
    private _path : string;
    private _originalPath : string;
    private _dependencies : Route[];
    private _order : number | undefined;
    private _code : string;

    constructor(path: string, code: string) {
        const computedPath = path.replace(/\/:[a-zA-Z0-9]+/g, "/1");
        this._dependencies = [];
        this._code = code;
        this._path = computedPath;
        this._originalPath = path;
    }

    public addDependency(route: Route) {
        this._dependencies.push(route);
    }

    public removeDependency(route: Route) {
        const index = this._dependencies.indexOf(route);
        if ( index > -1 ) {
            this._dependencies.splice(index, 1);
        }
    }

    public get id() {
        return this._id;
    }

    public get path() {
        return this._path;
    }

    public get order() {
        return this._order;
    }

    public set order(value) {
        this._order = value;
    }

    public get dependencies() {
        return this._dependencies;
    }

    public get code() {
        return this._code;
    }

    public get originalPath() {
        return this._originalPath;
    }
}