import { Router } from "express";
import nodeRouter from "./routes/node";

class DefaultRoute {
    public router: Router;

    public constructor() {
      this.router = Router({mergeParams: true});
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

        // Node
        this.router.use("/api/v1/node", nodeRouter);
    }
}
  
const defaultRoute = new DefaultRoute();
export default defaultRoute.router; 