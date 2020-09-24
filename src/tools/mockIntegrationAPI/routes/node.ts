import { NodeController } from "../controller/node";
import { Router } from "express";
import serviceRouter from "./service";

class DefaultRoute {
    public router: Router;
    public constructor() {
      this.router = Router({mergeParams: true});
      this.init();
    }
    private init() {

        this.router.get("/:nodeName", NodeController.getNode);
        this.router.get("/", NodeController.getAllNodes);
        this.router.post("/", NodeController.createNode);
        this.router.delete("/:nodeName/", NodeController.deleteNode);
        this.router.put("/:nodeName/updateCode", NodeController.updateCode);
        this.router.use("/:nodeName/services", serviceRouter);
    }
}

const defaultRoute = new DefaultRoute();
export default defaultRoute.router;