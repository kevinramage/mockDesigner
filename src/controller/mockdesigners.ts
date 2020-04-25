import * as winston from "winston";
import { MockProjectManagement } from "./mockProjectManagement";
import { MockDesigner } from "./mockdesigner";
import { KEYS } from "../constantes";
import { Mocks } from "../business/mocks";
import { Mock } from "../business/mock";

export class MockDesigners {

    private _mockProjectManagement : MockProjectManagement;
    private _mocks : Mocks;
    private _name : string = "MyMockApp";
    private _port : number = 7001;

    constructor() {
        this._mockProjectManagement = new MockProjectManagement();
        this._mocks = new Mocks();
        const mockDesigner = new MockDesigner();
        mockDesigner.read("tests/authentication.yml");
        this._mocks.addMock(mockDesigner.mock as Mock);
    }

    public validate() : boolean {
        winston.debug("MockDesigners.validate");
        return true;
    }

    public run() : void {
        winston.debug("MockDesigners.run");

        // Generate files
        this.generateFiles();

        // Write files
        this._mockProjectManagement.writeFiles("generated");
    }

    private generateFiles() {
        winston.debug("MockDesigners.run");

        // Generate main files
        this.addProjectFiles();

        // Generate files from mock file
        this._mocks.generate(this._mockProjectManagement);
    }

    private addProjectFiles() {
        winston.debug("MockDesigners.addProjectFiles");
        this._mockProjectManagement.addTemplate("package.json", {key: KEYS.APPNAME, value: this._name.toLowerCase()});
        this._mockProjectManagement.addTemplate("tsconfig.json");
        this._mockProjectManagement.addTemplate("index.ts", {key: KEYS.APPNAME, value: this._name}, { key: KEYS.APPPORT, value: this._port + ""});
        this._mockProjectManagement.addTemplate("app.ts");
        this._mockProjectManagement.addTemplate("routes.ts");
        this._mockProjectManagement.addTemplate("redisManager.ts");
        this._mockProjectManagement.addTemplate("templateManager.ts");
        this._mockProjectManagement.addTemplate("authenticationManager.ts");
    }
}