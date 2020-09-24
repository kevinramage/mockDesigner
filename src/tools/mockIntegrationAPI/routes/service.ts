import { NodeController } from "../controller/node";
import { NextFunction, Request, Response, Router } from "express";

class DefaultRoute {
    public router: Router;
    public constructor() {
      this.router = Router({mergeParams: true});
      this.init();
    }
    private init() {

    }
}

const defaultRoute = new DefaultRoute();
export default defaultRoute.router;