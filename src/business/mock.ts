import * as winston from "winston";
import * as util from "util";
import { Service } from "./service";

export class Mock {
    private _name : string;
    private _services : Service[];

    constructor() {
        this._name = "";
        this._services = [];
    }

    public generate() {
        var code = "import * as fs from \"fs\";\n";
        code += "import { Request, Response } from \"express\";\n";
        code += "import { TemplateManager } from \"../templateManager\";\n";
        code += "import { AuthenticationManager } from \"../authenticationManager\";\n";
        code += "import { ResponseHandler } from \"../responseHandler\";\n";
        code += "import { RedisManager } from \"../redisManager\";\n";
        code += "import { Context } from \"../context\";\n";
        code += "\n";
        code += util.format("export class %s {\n\n", this.controllerName);
        this._services.forEach(service => {
            code += service.generate();
        });
        code += "}\n";
        return code;
    }

    public generateImports() {
        winston.debug("Mock.generateImports");
        var code = "";
        code += util.format("import { %s } from \"./routes/%s\";\n", this.controllerName, this.controllerName);
        return code;
    }

    public generateRoutes() {
        winston.debug("Mock.generateRoutes");
        var code = "";
        this._services.forEach(service => {
            code += service.generateRoute();
        });
        return code;
    }

    public addService(service : Service) {
        service.mockName = this.controllerName;
        this._services.push(service);
    }

    public get name() {
        return this._name;
    }

    public set name(value) {
        this._name = value;
        this._services.forEach(service => { service.mockName = this.controllerName; });
    }

    public get controllerName() {
        return this._name.replace(" ", "_").toLowerCase();
    }
}