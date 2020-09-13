import * as winston from "winston";
import * as util from "util";
import { Service } from "./service";
import { RouteSolver } from "./routeSolver";
import { IServiceAction } from "./action/serviceAction";
import { ServiceGroup } from "./serviceGroup";

export class Mock {
    private _name : string;
    private _sourceCode : string;
    private _default : IServiceAction[];
    private _error : IServiceAction[];
    private _serviceGroups : ServiceGroup[];

    constructor() {
        this._name = "";
        this._sourceCode = "";
        this._default = [];
        this._serviceGroups = [];
        this._error = [];
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
        code += "import { MicroServiceManager, IStorage, IStorageParent } from \"../manager/microServiceManager\";\n";
        code += "import { Context } from \"../context\";\n";
        code += "import { XMLUtils } from \"../util/XMLUtils\";\n";
        code += "import { TimeUtils } from \"../util/TimeUtils\";\n";
        code += "import { ValidationUtils } from \"../util/validationUtils\";\n";
        code += "import { Condition } from \"../condition\";\n";
        code += "import { ConditionEvaluator } from \"../manager/conditionEvaluator\";\n";
        code += "import { EnumField } from \"../enumField\";\n";
        code += "\n";
        code += util.format("export class %s {\n\n", this.controllerName);
        this._serviceGroups.forEach(serviceGroup => {
            code += serviceGroup.generate();
        });
        code += this.generateDatabaseService("\t");
        code += this.generateDefaultResponseService("\t");
        code += this.generateSendInternalError("\t");
        code += this.generateSendSourceCodeService("\t");

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
        this._serviceGroups.forEach(serviceGroup => {
            code += serviceGroup.generateRoute();
        });
        code += this.generateServicesRoutes("\t\t");
        code += this.generateSendSourceCodeRoute("\t\t");
        code += this.generateDefaultRoute("\t\t");
        
        return code;
    }

    private generateDatabaseServiceRoutes(tab: string) {
        winston.debug("Mock.generateDatabaseServiceRoutes");
        var code = "";

        code += tab + util.format("this.router.route(\"/api/v1/_getDatabaseValue\").get(%s._getDatabaseValue);\n", this.controllerName);
        code += tab + util.format("this.router.route(\"/api/v1/_resetDatabaseCounter\").post(%s._resetDatabaseCounter);\n", this.controllerName);
        code += tab + util.format("this.router.route(\"/api/v1/_updateDatabaseValue\").put(%s._updateDatabaseValue);\n", this.controllerName);
        code += tab + util.format("this.router.route(\"/api/v1/_deleteDatabaseValue\").delete(%s._deleteDatabaseValue);\n\n", this.controllerName);
        code += tab + util.format("this.router.route(\"/api/v1/_getRequest\").get(%s._getRequest);\n\n", this.controllerName);

        return code;
    }

    private generateDefaultRoute(tab: string) {
        winston.debug("Mock.generateDefaultRoute");
        var code = "";
        code += tab + util.format("this.router.route(\"*\").all(%s._defaultResponse);\n\n", this.controllerName);
        return code;
    }

    private generateSendSourceCodeRoute(tab: string) {
        winston.debug("Mock.generateSendSourceCodeRoute");
        var code = "";
        code += tab + util.format("this.router.route(\"/api/v1/_sourceCode\").get(%s._sendSourceCode);\n\n", this.controllerName);
        return code;
    }

    private generateDatabaseService(tab: string) {
        winston.debug("Mock.generateDatabaseCounter");
        var code = "";

        // Generate get database counter
        code += tab + util.format("public static async _getDatabaseValue(req: Request, res: Response) {\n");
        code += tab + util.format("\twinston.debug(\"%s._getDatabaseCounter\");\n", this.controllerName);
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
        code += tab + util.format("\twinston.debug(\"%s._resetDatabaseCounter\");\n", this.controllerName);
        code += tab + util.format("\tawait RedisManager.instance.setValue(req.body.name, \"0\");\n");
        code += tab + util.format("\tres.status(204);\n");
        code += tab + util.format("\tres.end();\n");
        code += tab + util.format("}\n\n");

        // Generate update database value code
        code += tab + util.format("public static async _updateDatabaseValue(req: Request, res: Response) {\n");
        code += tab + util.format("\twinston.debug(\"%s._updateDatabaseCounter\");\n", this.controllerName);
        code += tab + util.format("\tawait RedisManager.instance.setValue(req.body.name, req.body.value);\n");
        code += tab + util.format("\tres.status(204);\n");
        code += tab + util.format("\tres.end();\n");
        code += tab + util.format("}\n\n");

        // Generate delete database value code
        code += tab + util.format("public static async _deleteDatabaseValue(req: Request, res: Response) {\n");
        code += tab + util.format("\twinston.debug(\"%s._updateDatabaseCounter\");\n", this.controllerName);
        code += tab + util.format("\tawait RedisManager.instance.deleteValue(req.query['name'] as string);\n");
        code += tab + util.format("\tres.status(204);\n");
        code += tab + util.format("\tres.end();\n");
        code += tab + util.format("}\n\n");

        // Generate get request
        code += tab + util.format("public static async _getRequest(req: Request, res: Response) {\n");
        code += tab + util.format("\twinston.debug(\"%s._getRequest\");\n", this.controllerName);
        code += tab + util.format("\tawait ResponseHandler.getRequest(req, res);\n");
        code += tab + util.format("}\n\n");

        return code;
    }

    private generateDefaultResponseService(tab: string) {
        winston.debug("Mock.generateDefaultResponseService");
        var code = "";
        code += tab + util.format("public static async _defaultResponse(req: Request, res: Response) {\n");
        code += tab + util.format("\tconst context = new Context(req);\n");
        code += tab + util.format("\tcontext.requestStorageExpiration = %d;\n\n", Service.DEFAULT_REQ_STORAGE_EXPIRATION);
        
        if ( this._default.length > 0 ) {

            // Apply actions defined in mock definition
            code += tab + util.format("\ttry {\n");
            this._default.forEach(action => {
                code += action.generate(tab + "\t\t");
            });
            code += tab + util.format("\t} catch ( ex ) {\n");
            code += tab + util.format("\t\twinston.error(\"%s - Internal error: \", ex);\n", this.controllerName);
            code += tab + util.format("\t\t%s.__sendInternalError(context, res);\n", this.controllerName);
            code += tab + util.format("\t}\n");
        } else {

            // Generate default method not allow response
            code += tab + util.format("\tResponseHandler.sendMethodNotAllow(context, res);\n");
        }
        code += tab + util.format("}\n\n");

        return code;
    }

    private generateSendSourceCodeService(tab: string) {
        winston.debug("Mock.generateSendSourceCodeService");
        var code = "";
        var body = this.sourceCode.replace(/\"/g, "\\\"").replace(/\r/g, "").replace(/\n/g, "\\n");
        body = body.replace(/\\\\"/g, "\\\"")
        code += tab + util.format("public static async _sendSourceCode(req: Request, res: Response) {\n");
        code += tab + util.format("\tResponseHandler.sendYAMLContent(\"%s\", res);\n", body);
        code += tab + util.format("}\n\n");
        return code;
    }

    private generateServicesRoutes(tab: string) {
        winston.debug("Mock.generateServicesRoutes");
        var code = "";

        // Use resolver to sort routes
        this._serviceGroups.forEach(serviceGroup => {
            serviceGroup.addRoute();
        });
        const routes = RouteSolver.instance.resolve();

        // Add route
        routes.forEach(r => {
            code += tab + util.format("%s\n", r.code );
        });

        return code;
    }

    private generateSendInternalError(tab: string) {
        var code = "";

        code += tab + util.format("public static async __sendInternalError(context: Context, res: Response) {\n");
        code += tab + util.format("\twinston.debug(\"%s.__sendInternalError\");\n", this.controllerName);

        if ( this._error.length > 0 ) {
            code += tab + util.format("\ttry {\n");
            this._error.forEach(action => {
                code += action.generate(tab + "\t\t");
            });
            code += tab + util.format("\t} catch ( ex ) {\n");
            code += tab + util.format("\t\tResponseHandler.sendInternalError(context, res);\t\n");
            code += tab + util.format("\t}\n");
        } else {
            code += tab + util.format("\tResponseHandler.sendInternalError(context, res);\t\n");
        }
        
        code += tab + util.format("}\n\n");

        return code;
    }

    public addServiceGroup(serviceGroup : ServiceGroup) {
        serviceGroup.mockName = this.controllerName;
        this._serviceGroups.push(serviceGroup);
    }

    public addDefaultAction(action: IServiceAction) {
        this._default.push(action);
    }

    public addErrorAction(action: IServiceAction) {
        this._error.push(action);
    }

    public get name() {
        return this._name;
    }

    public set name(value) {
        this._name = value;
        this._serviceGroups.forEach(serviceGroup => { serviceGroup.mockName = this.controllerName; });
    }

    public get controllerName() {
        return this._name.replace(" ", "_").toLowerCase();
    }

    public get sourceCode() {
        return this._sourceCode;
    }

    public set sourceCode(value) {
        this._sourceCode = value;
    }
}