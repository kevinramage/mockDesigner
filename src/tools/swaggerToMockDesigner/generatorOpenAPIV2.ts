import { OpenAPIV2 } from "openapi-types";
import { HTTP_METHODS } from "./constantes";
import { Service } from "./business/service";
import { Response } from "./business/response";
import { format } from "util";

export class GeneratorOpenAPIV2 {

    public run(paths: OpenAPIV2.PathsObject, definitions?: OpenAPIV2.DefinitionsObject) {
        const services : Service[] = [];
        Object.keys(paths).forEach(key => {

            // Initialize the service
            //const service = new Service();
            
            //service.businessObject = this.computeBusinessObject(key);
            //service.endWithVariable = this.computeEndWithVariable(key);

            // Navigate through path item

        });

        // Identify microservice
        //this.identifyMicroservice(services);

        return services;
    }

    private runService(services: Service[], operation: OpenAPIV2.OperationObject | undefined, path: string, methodName: string, definitions?: OpenAPIV2.DefinitionsObject) {

    }



    private generateResponseBodyFromReference(definitionName: string, definitions?: OpenAPIV2.DefinitionsObject) {
        const object : any = {};
        const definition = this.getDefinitionFromName(definitionName, definitions);
        if ( definition ) {
            if ( definition.properties ) {
                Object.keys(definition.properties).forEach(key => {
                    const property = (definition.properties as any)[key] as OpenAPIV2.SchemaObject;
                    if ( property.type && property.type == "integer" ) {
                        object[key] = 0;
                    } else if ( property.type && property.type == "string" ) {
                        if ( property.example ) {
                            object[key] = property.example;
                        } else if ( property.enum && property.enum.length > 0 ) {
                            object[key] = property.enum[0];
                        } else {
                            object[key] = "string";
                        }
                    } else if ( property["$ref"] && property["$ref"].includes("#/definitions/") ) {
                        const definitionName = property["$ref"].substring(("#/definitions/").length);
                        const subObject = this.generateResponseBodyFromReference(definitionName, definitions);
                        object[key] = subObject;
                    } else if ( property.type && property.items && property.type == "array" ) {
                        const items = property.items as any;
                        if ( items["$ref"] && items["$ref"].includes("#/definitions/") ) {
                            const definitionName = items["$ref"].substring(("#/definitions/").length);
                            const subObject = this.generateResponseBodyFromReference(definitionName, definitions);
                            object[key] = [ subObject ];
                        }
                    }
                });
            }
        }
        return object;
    }

    private getDefinitionFromName(definitionName: string, definitions?: OpenAPIV2.DefinitionsObject) : OpenAPIV2.SchemaObject | null {
        var definition : OpenAPIV2.SchemaObject | null = null;
        if ( definitions ) {
            Object.keys(definitions).forEach(key => {
                if ( key == definitionName ) {
                    definition = definitions[key];
                }
            });
        }
        return definition;
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

        // Generate main code
        files["code/" + name + ".yml" ] = this.generateMainCode(name, services);

        // Generate response code
        services.forEach(service => {
            service.responses.forEach(response => {
                if ( response.isIncludedInExternalFile ) {
                    const fileName = response.getExternalFileName(service.name);
                    files["responses/" + fileName] = JSON.stringify(response.content, null, 4);
                }
            });
        });

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
        content += this.generateResponse(service);
        content += "\n";

        return content;
    }

    private generateResponse(service: Service) {

        var content = "";

        if ( service.responses.length > 0 ) {

            const defaultResponse = service.defaultResponse;
            const response = defaultResponse || service.responses[0];
            content += format("  response:\n");
            content += format("    triggers:\n");
            content += format("    - type: none\n");
            content += format("      actions:\n");
            content += format("      - type: message\n");
            content += format("        status: %d \n", response.code);
            if ( response.isIncludedInExternalFile ) {
                content += format("        bodyFile: %s\n", response.getExternalFileName(service.name));
            } else {
                var body = "";
                if ( response.content ) {
                    body = format("\"%s\"", JSON.stringify(response.content).replace(/\"/g, "\\\""));
                }
                content += format("        body: %s\n", body)
            }
            if ( response.contentType != "") {
                content += format("        headers: \n");
                content += format("          Content-Type: %s\n", response.contentType);
            }
        }
        /*
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
        */

        return content;
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