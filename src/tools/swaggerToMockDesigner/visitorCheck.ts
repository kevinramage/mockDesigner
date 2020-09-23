import { Service } from "./business/service";
import { OpenAPIV2 } from "openapi-types";
import { HTTP_METHODS } from "./constantes";
import { Check } from "./business/check";
import { format } from "util";

export class VisitorCheck {

    private _services: Service[];
    private _definitions : OpenAPIV2.DefinitionsObject | undefined;

    /**
     * Constructor
     */
    constructor(services: Service[]) {
        this._services = services;
    }

    /**
     * Visit document
     * @param document document to visit
     */
    public visit(document: OpenAPIV2.Document) {

        // Definitions
        if ( document.definitions ) {
            this.visitDefinitions(document.definitions);
        }

        // Paths
        this.visitPaths(document.paths);
    }

    /**
     * Visit definitions
     * @param definitions definitions to visit
     */
    private visitDefinitions(definitions: OpenAPIV2.DefinitionsObject) {
        this._definitions = definitions;
    }

    /**
     * Visit paths
     * @param paths paths to visit
     */
    private visitPaths(paths: OpenAPIV2.PathsObject) {
        const instance = this;
        Object.keys(paths).forEach(key => {
            const path = this.transformPath(key);
            const pathItemObject = paths[key] as OpenAPIV2.PathItemObject;
            instance.visitPath(pathItemObject, path);
        });
    }

    /**
     * Visit path
     * @param pathItem path item to visit
     * @param path path to contact the service
     */
    private visitPath(pathItem: OpenAPIV2.PathItemObject, path: string) {
        this.visitOperation(pathItem.get, path, HTTP_METHODS.GET);
        this.visitOperation(pathItem.post, path, HTTP_METHODS.POST);
        this.visitOperation(pathItem.put, path, HTTP_METHODS.PUT);
        this.visitOperation(pathItem.delete, path, HTTP_METHODS.DELETE);
        this.visitOperation(pathItem.patch, path, HTTP_METHODS.PATCH);
    }

    /**
     * Visit an operation
     * @param operation operation to visit
     * @param path path to visit
     * @param methodName method name to visit
     */
    private visitOperation(operation: OpenAPIV2.OperationObject | undefined, path: string, methodName: string) {
        if ( operation ) {
            var checks : Check[] = [];

            // Identify service
            const service = this.identifyService(this._services, operation.operationId);
            if ( service ) {

                // Parameters
                if ( operation.parameters ) {
                    checks = checks.concat(checks, this.visitParameters(operation.parameters));
                }

                service.checks = checks;

            }
        }
    }

    /**
     * Visit parameters
     * @param parameters parameters
     */
    private visitParameters(parameters: OpenAPIV2.Parameters) {
        const instance = this;
        var checks : Check[] = [];
        parameters.forEach(param => {
            var check = null;

            // GeneralParameterObject
            if (this.instanceOfGeneralParameterObject(param)) {
                const generalParameter = param as OpenAPIV2.GeneralParameterObject;
                check = instance.visitGeneralParameter(generalParameter);

            // ReferenceParameter
            } else if ( this.instanceOfReferenceObject(param) ) {
                const referenceParameter = param as OpenAPIV2.ReferenceObject;
                check = instance.visitReference(referenceParameter.$ref, "");

            // InBodyParameter
            } else if ( this.instanceOfInBodyParameterObject(param) ) {
                const inBodyParameter = param as OpenAPIV2.InBodyParameterObject;
                check = instance.visitInBodyParameter(inBodyParameter);
            }

            if ( check ) {
                checks = checks.concat(check);
            }
        });
        return checks;
    }

    /**
     * Visit in body parameter
     * @param parameter parameter
     */
    private visitInBodyParameter(parameter: OpenAPIV2.InBodyParameterObject) {
        var checks : Check[] = [];

        // Check if parameter is required
        if ( parameter.required ) {

            // Not managed now (Cookie, query, header, path, body)
        }

        // Reference object
        var subChecks = [];
        if ( this.instanceOfReferenceObject(parameter.schema) ) {
            const reference = parameter.schema as OpenAPIV2.ReferenceObject;
            subChecks = this.visitReference(reference.$ref, "");
            checks = checks.concat(subChecks);

        // Schema object
        } else {
            subChecks = this.visitSchema(parameter.schema, "");
            checks = checks.concat(subChecks);
        }

        return checks;
    }

    /**
     * Visit general parameter
     * @param parameter parameter
     */
    private visitGeneralParameter(parameter: OpenAPIV2.GeneralParameterObject) {
        var checks : Check[] = [];

        // Check if parameter is required
        if ( parameter.required ) {

            // Not managed now (Cookie, query, header, path, body)
        }

        // Schema
        var subChecks = [];

        if ( parameter.$ref ) {
            subChecks = this.visitReference(parameter.$ref, "");
            checks = checks.concat(subChecks);
        }

        return checks;
    }

    /**
     * Visit reference
     * @param referenceName reference name to visit
     * @param path path built
     */
    private visitReference(referenceName: string, path: string) : Check[] {
        const definitionName = referenceName.substring(("#/definitions/").length);
        const definition = (this._definitions as OpenAPIV2.DefinitionsObject)[definitionName] as OpenAPIV2.SchemaObject;
        return this.visitSchema(definition, path);
    }

    /**
     * Visit schema
     * @param schemaObject schema to visit
     * @param path path built
     */
    private visitSchema(schemaObject: OpenAPIV2.SchemaObject, path: string) : Check[] {
        const instance = this;
        var checks : Check[] = [];

        // Integer 
        if ( schemaObject.type && schemaObject.type == "integer" ) {
            if ( schemaObject.required ) {
                checks.push(new Check(this.concatenatePath(path, schemaObject.id)))
            }
            if ( schemaObject.enum ) {
                checks.push(new Check(path, schemaObject.enum as string[]));
            }

        // String
        } else if ( schemaObject.type && schemaObject.type == "string" ) {
            if ( schemaObject.required ) {
                checks.push(new Check(this.concatenatePath(path, schemaObject.id)))
            }
            if ( schemaObject.enum ) {
                checks.push(new Check(path, schemaObject.enum as string[]));
            }

        // Boolean
        } else if ( schemaObject.type && schemaObject.type == "boolean" ) {
            if ( schemaObject.required ) {
                checks.push(new Check(this.concatenatePath(path, schemaObject.id)))
            }
            if ( schemaObject.enum ) {
                checks.push(new Check(path, schemaObject.enum as string[]));
            }

        // Items
        } else if ( schemaObject.items ) {
            const subPath = this.concatenatePath(path, schemaObject.id);
            checks = checks.concat(this.visitItemsObject(schemaObject.items, subPath));

        // Properties
        } else if ( schemaObject.properties ) {
            const instance = this;

            // Required
            if ( schemaObject.required ) {
                schemaObject.required.forEach(req => {
                    checks.push(new Check(instance.concatenatePath(path, req)));
                });
            }

            // Properties
            Object.keys(schemaObject.properties).forEach(key => {
                const property = (schemaObject.properties as any)[key] as OpenAPIV2.SchemaObject;
                const subPath = instance.concatenatePath(path, key);
                var subChecks = instance.visitSchema(property, subPath);
                checks = checks.concat(subChecks);
            });

        } else {
            const reference = (schemaObject as any) as OpenAPIV2.ReferenceObject;

            // Reference
            if ( this.instanceOfReferenceObject(reference)) {
                return this.visitReference(reference.$ref, path);
            }
        }

        return checks;
    }


    /**
     * Visit items object
     * @param items items to visit
     * @param path path built
     */
    private visitItemsObject(items: OpenAPIV2.ItemsObject, path: string) : Check[] {
        var checks : Check[] = [];
        
        // Integer
        if ( items.type && items.type == "integer" ) {
            if ( items.enum ) {
                checks.push(new Check(path, items.enum as string[]));
            }

        // String
        } else if ( items.type && items.type == "string" ) {
            if ( items.enum ) {
                checks.push(new Check(path, items.enum as string[]));
            }

        // Boolean
        } else if ( items.type && items.type == "boolean" ) {
            if ( items.enum ) {
                checks.push(new Check(path, items.enum as string[]));
            }

        // Items
        } else if ( items.items ) {
            checks = checks.concat(this.visitItemsObject(items.items, path));

        // Reference
        } else if ( items.$ref ) {
            checks = checks.concat(this.visitReference(items.$ref, path));
        }

        return checks;
    }










    /**
     * ---------------------------------------------------------------------------------
     * - UTILS
     * ---------------------------------------------------------------------------------
     */

    /**
     * Transform path
     * @param path path to transform
     */
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

    /**
     * Concatenate pathA and pathB and manage empty cases
     * @param pathA pathA
     * @param pathB pathB
     */
    private concatenatePath(pathA: string, pathB: string | undefined) {
        if ( pathA != "" ) {
            return format("%s.%s", pathA, pathB);
        } else if ( pathB ) {
            return pathB;
        } else {
            return "";
        }
    }

    /**
     * Identify a service from it's name
     * @param services services to analyze
     * @param name service's name
     */
    private identifyService(services: Service[], name?: string) {
        return services.find(s => { return s.name == name });
    }

    /**
     * Analyze if an interface is an interface of general parameter
     * @param object object to analyze
     */
    private instanceOfGeneralParameterObject(object: any): object is OpenAPIV2.GeneralParameterObject {
        return 'type' in object;
    }

    /**
     * Analyze if an interface is an interface of in body parameter
     * @param object object to analyze
     */
    private instanceOfInBodyParameterObject(object: any): object is OpenAPIV2.InBodyParameterObject {
        return 'schema' in object;
    }

    /**
     * Analyze if an interface is an interface of reference object
     * @param object object to analyze
     */
    private instanceOfReferenceObject(object: any): object is OpenAPIV2.ReferenceObject {
        return '$ref' in object;
    }
}