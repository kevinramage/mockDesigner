import * as winston from "winston";
import { expect } from "chai";
import { RouteSolver } from "../business/routeSolver";

describe("Router Solver", () => {

    it("Nominal 1", () => {
        const routeSolver = new RouteSolver();
        routeSolver.addRoute("GET", "/api/v1/command", "");
        routeSolver.addRoute("GET", "/api/v1/command/:cmdId", "");
        const routes = routeSolver.resolve();
        expect(routes.length).to.equals(2);
        expect(routes[0].originalPath).to.equals("/api/v1/command/:cmdId");
        expect(routes[1].originalPath).to.equals("/api/v1/command");
    });

    it("Nominal 2", () => {
        const routeSolver = new RouteSolver();
        routeSolver.addRoute("GET", "/api/v1/command/:cmdId", "");
        routeSolver.addRoute("GET", "/api/v1/command", "");
        const routes = routeSolver.resolve();
        expect(routes.length).to.equals(2);
        expect(routes[0].originalPath).to.equals("/api/v1/command/:cmdId");
        expect(routes[1].originalPath).to.equals("/api/v1/command");
    });
})