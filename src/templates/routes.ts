import { Router } from "express";
// {{.imports}}

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

// {{.routes}}
    }
}
  
const defaultRoute = new DefaultRoute();
export default defaultRoute.router; 