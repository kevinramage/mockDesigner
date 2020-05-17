import * as winston from "winston";
import * as util from "util";
import { IServiceTrigger } from "./trigger/serviceTrigger";
import { Route } from "./route";
import { IAuthentication } from "./authentication/authentication";
import { Behaviour } from "./behaviour";

export class Service {
    private _mockName: string;
    private _name : string;
    private _soapAction : string | undefined;
    private _delay : number | undefined;
    private _authentication : IAuthentication | undefined;
    private _triggers : IServiceTrigger[];
    private _behaviours : Behaviour[];
    private _route : Route;

    constructor() {
        this._mockName = "";
        this._name = "";
        this._triggers = [];
        this._behaviours = [];
        this._route = new Route();
    }

    public generate() {
        winston.debug("Service.generate");
        var code = this.generateService("\t");
        code += this.generateBehaviourServices("\t");
        return code;
    }

    private generateService(tab: string) {
        winston.debug("Service.generateService");

        // Generate counter
        var code = tab + util.format("private static %s_counter : number = 0;\n\n", this.methodName);

        // Generate response handler
        code += tab + util.format("public static async %s(req: Request, res: Response) {\n", this.methodName);
        code += tab + util.format("\twinston.debug(\"%s.%s\");\n", this.mockName, this.methodName);

        // Define context
        code += tab + "\tconst context = new Context(req);\n";

        // Prepare the call to the service method
        var codeToCallService = "";
        if ( this.delay ) {
            codeToCallService = util.format("setTimeout(%s._%s.bind(this, context, res), %s);\n", this.mockName, this.methodName, this.delay + "");
        } else {
            codeToCallService = util.format("%s._%s(context, res);\n", this.mockName, this.methodName)
        }

        // Manage authentication
        if ( this.authentication ) {
            code += this.authentication.generate(tab + "\t", this.methodName);
            code += tab + "\tif ( authenticationSucceed ) {\n";
            code += tab + "\t\t" + codeToCallService;
            code += tab + "\t}\n";
        } else {
            code += tab + "\t" + codeToCallService;
        }
        code += tab + "}\n\n";

        // Generate business method
        code += tab + util.format("public static async _%s(context: Context, res: Response) {\n", this.methodName);
        code += tab + util.format("\twinston.debug(\"%s._%s\");\n", this.mockName, this.methodName);

        // Apply behaviours
        code += tab + "\tvar triggerApplied = false, expression, evaluation, key, behaviour;\n\n"
        this._behaviours.forEach(behaviour => {
            code += behaviour.generate(tab + "\t");
        });

        // Apply triggers
        this._triggers.forEach(trigger => {
            code += trigger.generate(this.mockName, this.methodName, tab + "\t");
        });        

        // Apply a default trigger if there are no trigger to apply
        code += tab + "\tif ( !triggerApplied ) {\n";
        code += tab + util.format("\t\twinston.warn(\"%s.%s: No trigger to apply\");\n", this.mockName, this.methodName);
        code += tab + "\t\tResponseHandler.sendError(res, \"No trigger to apply\", \"\");\n";
        code += tab + "\t}\n";

        code += tab + "}\n\n";

        return code;
    }

    private generateBehaviourServices(tab: string) {
        winston.debug("Service.generateBehaviourServices");
        var code = "";

        // Get a behaviour
        code += tab + util.format("public static async _%s_getBehaviour(req: Request, res: Response) {\n", this.methodName);
        code += tab + util.format("\twinston.debug(\"%s._%s_getBehaviour\");\n", this.mockName, this.methodName);
        code += tab + util.format("\tconst key = \"%s__%s\";\n", this.mockName, this.methodName);
        code += tab + "\tconst behaviour = await BehaviourManager.getBehaviour(key, req.params.name);\n";
        code += tab + "\tres.setHeader('Content-Type', 'application/json');\n";
        code += tab + "\tres.status(behaviour ? 200 : 404);\n";
        code += tab + "\tif ( behaviour ) {\n"
        code += tab + "\t\tres.write(JSON.stringify(behaviour));\n";
        code += tab + "\t}\n";
        code += tab + "\tres.end();\n";
        code += tab + "}\n\n";

        // Get all behaviours
        code += tab + util.format("public static async _%s_getAllBehaviours(req: Request, res: Response) {\n", this.methodName);
        code += tab + util.format("\twinston.debug(\"%s._%s_getAllBehaviours\");\n", this.mockName, this.methodName);
        code += tab + util.format("\tconst key = \"%s__%s\";\n", this.mockName, this.methodName);
        code += tab + "\tconst behaviours = await BehaviourManager.getAllBehaviours(key);\n";
        code += tab + "\tres.setHeader('Content-Type', 'application/json');\n";
        code += tab + "\tres.status(200);\n";
        code += tab + "\tres.write(JSON.stringify(behaviours));\n";
        code += tab + "\tres.end();\n";
        code += tab + "}\n\n";
        
        // Create behaviour
        code += tab + util.format("public static async _%s_createBehaviour(req: Request, res: Response) {\n", this.methodName);
        code += tab + util.format("\twinston.debug(\"%s._%s_createBehaviour - Name: \" + req.body.name);\n", this.mockName, this.methodName);
        code += tab + util.format("\tconst key = \"%s__%s\";\n", this.mockName, this.methodName);
        code += tab + "\tconst created = await BehaviourManager.createBehaviour(key, req.body.name);\n";
        code += tab + "\tres.status(201);\n";
        code += tab + "\tres.write(JSON.stringify(created));\n";
        code += tab + "\tres.end();\n";
        code += tab + "}\n\n";

        // Delete behaviour
        code += tab + util.format("public static async _%s_deleteBehaviour(req: Request, res: Response) {\n", this.methodName);
        code += tab + util.format("\twinston.debug(\"%s._%s_deleteBehaviour\");\n", this.mockName, this.methodName);
        code += tab + util.format("\tconst key = \"%s__%s\";\n", this.mockName, this.methodName);
        code += tab + "\tconst deleted = await BehaviourManager.deleteBehaviour(key, req.params.name);\n";
        code += tab + "\tres.status(deleted ? 204 : 404);\n"
        code += tab + "\tres.end();\n";
        code += tab + "}\n\n";

        // Delete all behaviours
        code += tab + util.format("public static async _%s_deleteAllBehaviours(req: Request, res: Response) {\n", this.methodName);
        code += tab + util.format("\twinston.debug(\"%s._%s_deleteAllBehaviours\");\n", this.mockName, this.methodName);
        code += tab + util.format("\tconst key = \"%s__%s\";\n", this.mockName, this.methodName);
        code += tab + "\tawait BehaviourManager.deleteAllBehaviours(key);\n";
        code += tab + "\tres.status(204);\n"
        code += tab + "\tres.end();\n";
        code += tab + "}\n\n";

        return code;
    }

    public generateRoute() {
        winston.debug("Service.generateRoute");
        return this._route.generate(this.mockName ,this);
    }

    public addTrigger(trigger: IServiceTrigger) {
        this._triggers.push(trigger);
    }

    public addBehaviour(behaviour: Behaviour) {
        behaviour.mockName = this.mockName;
        behaviour.serviceName = this.methodName;
        this._behaviours.push(behaviour);
    }

    public get name() {
        return this._name;
    }
    public set name(value) {
        this._name = value;
        const instance = this;
        this._behaviours.forEach(behaviour => {
            behaviour.mockName = instance.methodName;
        });
    }

    public get route() {
        return this._route;
    }
    public set route(value) {
        this._route = value;
    }

    public get authentication() {
        return this._authentication;
    }
    public set authentication(value) {
        this._authentication = value;
    }

    public get mockName() {
        return this._mockName;
    }
    public set mockName(value) {
        this._mockName = value;
        this._behaviours.forEach(behaviour => {
            behaviour.mockName = value;
        });
    }

    public get soapAction() {
        return this._soapAction;
    }
    public set soapAction(value) {
        this._soapAction = value;
    }

    public get delay() {
        return this._delay;
    }
    public set delay(value) {
        this._delay = value;
    }

    public get methodName() {
        return this._name.replace(" ", "_").toLowerCase();
    }
}