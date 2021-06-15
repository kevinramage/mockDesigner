import { METHODS } from "../business/utils/enum";
import { Router } from "express";

class DefaultRoute {
    public router: Router;

    public constructor() {
      this.router = Router();
      this.init();
    }

    private init() {

        // Default header
        this.router.use("/", (req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            next();
        });
    }

    public addRoute(path: string, method: string, handler: ((req: any, res: any) => void )) {
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

    private addGETRoute(path: string, handler: ((req: any, res: any) => void )) {
        this.router.get(path, handler);
    }

    private addPOSTRoute(path: string, handler: ((req: any, res: any) => void )) {
        this.router.post(path, handler);
    }

    private addPUTRoute(path: string, handler: ((req: any, res: any) => void )) {
        this.router.put(path, handler);
    }

    private addDELETERoute(path: string, handler: ((req: any, res: any) => void )) {
        this.router.delete(path, handler);
    }
}
  
const defaultRoute = new DefaultRoute();
export default defaultRoute; 