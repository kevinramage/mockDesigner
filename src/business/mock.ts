import * as winston from "winston";
import * as util from "util";
import { Service } from "./service";
import { RouteSolver } from "./routeSolver";

export class Mock {
    private _name : string;
    private _services : Service[];

    constructor() {
        this._name = "";
        this._services = [];
    }

    public generate() {
        var code = "import * as fs from \"fs\";\n";
        code += "import * as winston from \"winston\";\n";
        code += "import { Request, Response } from \"express\";\n";
        code += "import { TemplateManager } from \"../manager/templateManager\";\n";
        code += "import { AuthenticationManager } from \"../manager/authenticationManager\";\n";
        code += "import { ResponseHandler } from \"../manager/responseHandler\";\n";
        code += "import { RedisManager } from \"../manager/redisManager\";\n";
        code += "import { BehaviourManager } from \"../manager/behaviourManager\";\n";
        code += "import { Context } from \"../context\";\n";
        code += "import { XMLUtils } from \"../util/XMLUtils\";\n";
        code += "import { TimeUtils } from \"../util/TimeUtils\";\n";
        code += "import { ValidationUtils } from \"../util/ValidationUtils\";\n";
        code += "\n";
        code += util.format("export class %s {\n\n", this.controllerName);
        this._services.forEach(service => {
            code += service.generate();
        });
        code += this.generateDatabaseService("\t");
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

        code += this.generateDatabaseServiceRoutes("\t\t");
        this._services.forEach(service => {
            code += service.generateRoute();
        });
        code += this.generateServicesRoutes("\t\t");
        
        return code;
    }

    private generateDatabaseServiceRoutes(tab: string) {
        winston.debug("Mock.generateDatabaseServiceRoutes");
        var code = "";

        code += tab + util.format("this.router.route(\"/api/v1/_getDatabaseValue\").get(%s._getDatabaseValue);\n", this.controllerName);
        code += tab + util.format("this.router.route(\"/api/v1/_resetDatabaseCounter\").post(%s._resetDatabaseCounter);\n", this.controllerName);
        code += tab + util.format("this.router.route(\"/api/v1/_updateDatabaseValue\").put(%s._updateDatabaseValue);\n", this.controllerName);
        code += tab + util.format("this.router.route(\"/api/v1/_deleteDatabaseValue\").delete(%s._deleteDatabaseValue);\n\n", this.controllerName);

        return code;
    }

    private generateDatabaseService(tab: string) {
        winston.debug("Mock.generateDatabaseCounter");
        var code = "";

        // Generate get database counter
        code += tab + util.format("public static async _getDatabaseValue(req: Request, res: Response) {\n");
        code += tab + util.format("\twinston.debug(\"%s._getDatabaseCounter\");\n", this.name);
        code += tab + util.format("\tconst value = await RedisManager.instance.getValue(req.query['name'] as string);\n");
        code += tab + util.format("\tif ( value != null ) {\n");
        code += tab + util.format("\t\tres.status(200);\n");
        code += tab + util.format("\t\tres.write(value + \"\");\n");
        code += tab + util.format("\t} else {\n");
        code += tab + util.format("\t\tres.status(404);\n");
        code += tab + util.format("\t\tres.write(\"Ressource not found\");\n");
        code += tab + util.format("\t}\n");
        code += tab + util.format("\tres.end();\n");
        code += tab + util.format("}\n\n");

        // Generate reset database counter
        code += tab + util.format("public static async _resetDatabaseCounter(req: Request, res: Response) {\n");
        code += tab + util.format("\twinston.debug(\"%s._resetDatabaseCounter\");\n", this.name);
        code += tab + util.format("\tawait RedisManager.instance.setValue(req.body.name, \"0\");\n");
        code += tab + util.format("\tres.status(204);\n");
        code += tab + util.format("\tres.end();\n");
        code += tab + util.format("}\n\n");

        // Generate update database value code
        code += tab + util.format("public static async _updateDatabaseValue(req: Request, res: Response) {\n");
        code += tab + util.format("\twinston.debug(\"%s._updateDatabaseCounter\");\n", this.name);
        code += tab + util.format("\tawait RedisManager.instance.setValue(req.body.name, req.body.value);\n");
        code += tab + util.format("\tres.status(204);\n");
        code += tab + util.format("\tres.end();\n");
        code += tab + util.format("}\n\n");

        // Generate delete database value code
        code += tab + util.format("public static async _deleteDatabaseValue(req: Request, res: Response) {\n");
        code += tab + util.format("\twinston.debug(\"%s._updateDatabaseCounter\");\n", this.name);
        code += tab + util.format("\tawait RedisManager.instance.deleteValue(req.query['name'] as string);\n");
        code += tab + util.format("\tres.status(204);\n");
        code += tab + util.format("\tres.end();\n");
        code += tab + util.format("}\n\n");

        return code;
    }

    private generateServicesRoutes(tab: string) {
        winston.debug("Mock.generateServicesRoutes");
        var code = "";

        // Use resolver to sort routes
        this._services.forEach(s => {
            const functionName = util.format("%s.%s", s.mockName, s.methodName);
            RouteSolver.instance.addRoute(s.route.method, s.route.path, functionName);
        });
        const routes = RouteSolver.instance.resolve();

        // Add route
        routes.forEach(r => {
            code += tab + util.format("%s\n", r.code );
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