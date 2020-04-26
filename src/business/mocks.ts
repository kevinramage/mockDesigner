import * as winston from "winston";
import * as util from "util";
import { Mock } from "./mock";
import { MockProjectManagement } from "../controller/mockProjectManagement";
import { KEYS } from "../constantes";

export class Mocks {
    private _mocks : Mock[];

    constructor() {
        this._mocks = [];
    }

    public addMock(mock: Mock) {
        this._mocks.push(mock);
    }

    public generate(mockProjectManagement: MockProjectManagement) {
        winston.debug("Mocks.generate");
        this.updateImports(mockProjectManagement);
        this.updateRoutes(mockProjectManagement);
        this._mocks.forEach(mock => {
            const fileName = util.format("routes/%s.ts", mock.controllerName);
            const body = mock.generate();
            mockProjectManagement.createFile(fileName, body);
        });
    }

    private updateImports(mockProjectManagement: MockProjectManagement) {
        winston.debug("Mocks.updateImports");
        var code = "";
        this._mocks.forEach(mock => { code += mock.generateImports(); })
        mockProjectManagement.updateFile("routes.ts", KEYS.IMPORTS, code);
    }

    private updateRoutes(mockProjectManagement: MockProjectManagement) {
        winston.debug("Mocks.updateRoutes");
        var code = "";
        this._mocks.forEach(mock => { code += mock.generateRoutes(); })
        mockProjectManagement.updateFile("routes.ts", KEYS.ROUTES, code);
    }
}