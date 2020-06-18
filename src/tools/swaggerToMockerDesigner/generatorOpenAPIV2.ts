import { OpenAPIV2 } from "openapi-types";
import { HTTP_METHODS } from "./constantes";
import { Service } from "./business/service";
import { Response } from "./business/response";
import { format } from "util";

export class GeneratorOpenAPIV2 {

    public run(paths: OpenAPIV2.PathsObject) {
        const services : Service[] = [];
        Object.keys(paths).forEach(key => {

            // Initialize the service
            const service = new Service();
            service.path = this.transformPath(key);;
            service.businessObject = this.computeBusinessObject(key);
            service.endWithVariable = this.computeEndWithVariable(key);

            // Navigate through path item
            const pathItemObject = paths[key] as OpenAPIV2.PathItemObject;
            if ( pathItemObject ) {
                this.runService(service, pathItemObject.get, service.path, HTTP_METHODS.GET);
                this.runService(service, pathItemObject.post, service.path, HTTP_METHODS.POST);
                this.runService(service, pathItemObject.put, service.path, HTTP_METHODS.PUT);
                this.runService(service, pathItemObject.delete, service.path, HTTP_METHODS.DELETE);
                this.runService(service, pathItemObject.patch, service.path, HTTP_METHODS.PATCH);
            }

            services.push(service);
        });

        // Identify microservice
        this.identifyMicroservice(services);

        return services;
    }

    private runService(service: Service, operation: OpenAPIV2.OperationObject | undefined, path: string, methodName: string) {
        if ( operation ) {

            // Add information on service
            if ( operation.operationId ) {
                service.name = operation.operationId;
            }

            // Navigate through responses
            Object.keys(operation.responses).forEach(responseKey => {
                const response = new Response();
                //console.info(methodName + " " + path + "   - " + responseKey);

                // Response code
                const keyCode = Number.parseInt(responseKey);
                if ( keyCode != NaN) {
                    response.code = keyCode;
                }

                // Response content type
                if ( operation.consumes && operation.consumes.length > 0 ) {
                    response.contentType = operation.consumes[0];
                }

                // Response body
                const responseObject = operation.responses[responseKey];
                if ( responseObject.schema ) {
                
                }

                service.addResponse(response);
            });

            // Default
        }
    }

    private identifyMicroservice(services: Service[]) {

        // Group by business object
        const businessObjects : { [ id: string ] : Service[] } = {};
        services.forEach(service => {
            if ( service.businessObject ) {
                if ( businessObjects[service.businessObject] ) {
                    businessObjects[service.businessObject].push(service);
                } else {
                    businessObjects[service.businessObject] = [];
                }
            }
        });

        // Search a business object with at least a POST and a GET service
        Object.keys(businessObjects).forEach(bo => {
            if ( businessObjects[bo].length >= 2 ) {
                console.info("Business Object: " + bo);
                console.info(businessObjects[bo].map(s => { return s.method + "-" + s.path; }));
                const getService = businessObjects[bo].find(s => { return s.method == HTTP_METHODS.GET; });
                const postService = businessObjects[bo].find(s => { return s.method == HTTP_METHODS.POST; });
                if ( getService && postService ) {
                    console.info("Microservice: " + bo);
                    businessObjects[bo].forEach(s => { s.identifyMicroservice(); } );
                }
            }
        });
    }

    private transformPath(path: string) : string {
        const regex = /{\s*([a-zA-Z0-9]+)\s*}/g;
        const match = regex.exec(path);
        if ( match && match.length > 1) {
            const result = path.replace(match[0], ":" + match[1]);
            return this.transformPath(result);
        } else {
            return path;
        }
    }

    private computeBusinessObject(path: string) {
        const subPaths = path.split("/");
        var businessObject = "";
        subPaths.forEach(sp => { 
            if ( sp.trim() != "" && !(sp.trim().startsWith("{") && sp.trim().endsWith("}")) ) {
                businessObject += sp.trim() + "."
            }
        });
        if ( businessObject != "" ) {
            businessObject = businessObject.substring(0, businessObject.length - 1);
        }
        return businessObject;
    }

    private computeEndWithVariable(path: string) {
        const subPaths = path.split("/");
        if ( subPaths.length > 0) {
            return subPaths[subPaths.length - 1].startsWith("{") && subPaths[subPaths.length - 1].startsWith("}");
        } else {
            return false;
        }
    }

    public generateMockDescription(name: string, services: Service[]) {
        const files : { [ path: string] : string } = {};
        files["code/" + name + ".yml" ] = this.generateMainCode(name, services);

        return files;
    }

    private generateMainCode(name: string, services: Service[]) {
        const instance = this;
        var content = "";

        content += format("name: %s\n", name);
        content += "services:\n";
        services.forEach(service => {
            content += instance.generateService(service);
        });

        return content;
    }

    private generateService(service: Service) {
        var content = "";

        // Service
        content += format("- name: %s\n", service.name);
        content += format("  method: %s\n", service.method.toUpperCase());
        content += format("  path: %s\n", service.path);

        // Response
        content += "  response:\n";
        content += "    triggers:\n";
        this.generateResponse(service);

        content += "\n";

        return content;
    }

    private generateResponse(service: Service) {

        const defaultService = service.defaultService;
        
        // Default service
        if ( defaultService ) {
            
            // Microservice
            if ( service.microserviceAction != "" ) {
                this.generateMicroserviceResponse(service);
            } else {
                this.generateDefaultResponse(defaultService);
            }
        }
    }

    private generateDefaultResponse(response: Response) {
        var content = "";

        content += format("    - type: none\n");
        content += format("      status: %d\n", response.code);
        if ( response.contentType) {
            content += format("      headers:\n");
            content += format("        content-type: %s\n", response.contentType);
        }
        content += format("      body: \"\"\n");

        return content;
    }

    private generateMicroserviceResponse(service: Service) {
        var content = "";

        content += format("    - type: microservice\n");
        content += format("      action: %s\n", service.microserviceAction);
        content += format("      storage: %s\n", service.businessObject);
        content += format("      keys:\n");

        return content;
    }
}