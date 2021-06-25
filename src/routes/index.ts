import { METHODS } from "../business/utils/enum";
import { Router, Response } from "express";
import { OptionsManager } from "../business/core/optionsManager";

class DefaultRoute {
    public router: Router;

    public constructor() {
      this.router = Router();
      this.init();
    }

    private init() {

        // Default header
        this.router.use("/", (req, res: Response, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            next();
        });
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

    public addDefaultRoute(listeners: string[]) {
        this.router.use((err: Error, req: any, res: Response, next: Function) => {
            
            // Error hanling
            if (err) { next(err); return; }

            // Manage error handling
            res.status(404);
            const data : any = { code: 404, message: "Ressource not found" };

            // Add debug informations
            if (OptionsManager.instance.debug) {
                data.requestPath = req.path;
                data.listenersRegistered = listeners;
                data.version = "Mock Designer v" + OptionsManager.instance.version;
            }
            
            res.setHeader("Content-Type", "application/json");
            res.send(JSON.stringify(data));
            res.end();
        });
    }
}
  
const defaultRoute = new DefaultRoute();
export default defaultRoute; 