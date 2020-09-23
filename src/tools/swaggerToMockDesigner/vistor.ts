import { Service } from "./business/service";
import { Response } from "./business/response";
import { OpenAPIV2 } from "openapi-types";
import { HTTP_METHODS } from "./constantes";

export class Visitor {

    private _services : Service[];
    private _definitions : OpenAPIV2.DefinitionsObject | undefined;

    /**
     * Constructor
     */
    constructor() {
        this._services = [];
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

        return this._services;
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
     * Visit operation
     * @param operation operation to visit
     * @param path path to use
     * @param methodName method name to use
     */
    private visitOperation(operation: OpenAPIV2.OperationObject | undefined, path: string, methodName: string) {
        if ( operation ) {
            const service = new Service();

            // Path and Method
            service.path = path;
            service.method = methodName;

            // Add information on service
            if ( operation.operationId ) {
                service.name = operation.operationId;
            }

            // Responses
            service.responses = this.visitResponses(operation);

            this._services.push(service);
        }
    }

    /**
     * Visit responses
     * @param operation operation to visit
     */
    private visitResponses(operation: OpenAPIV2.OperationObject) {
        const responses : Response[] = [];
        const instance = this;
        Object.keys(operation.responses).forEach(responseKey => {
            const responseObject = operation.responses[responseKey];
            const response = instance.visitResponse(operation, responseObject, responseKey);
            responses.push(response);
        });
        return responses;
    }

    /**
     * Visit response
     * @param operation operation to visit
     * @param responseObject response to visit
     * @param keyCode status code of the response visited
     */
    private visitResponse(operation: OpenAPIV2.OperationObject, responseObject: OpenAPIV2.ResponseObject, keyCode: string) {
        const response = new Response();

        // Response code
        const statusCode = Number.parseInt(keyCode);
        if ( !isNaN(statusCode)) {
            response.code = statusCode;
        }

        // Response content type
        response.contentType = this.identifyServiceContentType(operation);

        // Response body
        response.content = this.visitResponseBody(responseObject);

        return response;
    }

    /**
     * Visit response object
     * @param responseObject response to visit
     */
    private visitResponseBody(responseObject: OpenAPIV2.ResponseObject) {
        if ( responseObject.schema ) {

            const schemaObject = responseObject.schema as OpenAPIV2.SchemaObject;
            const referenceObject = responseObject.schema as OpenAPIV2.ReferenceObject;

            // Reference
            if ( referenceObject && referenceObject.$ref ) {
                return this.visitReferenceObject(referenceObject.$ref);
            
            // Schema
            } else if ( schemaObject ) {
                return this.visitSchemaObject(schemaObject);
            }

        }

        return null;
    }

    /**
     * Visit schema object
     * @param schemaObject schema object
     */
    private visitSchemaObject(schemaObject: OpenAPIV2.SchemaObject) {
        
        // Integer 
        if ( schemaObject.type && schemaObject.type == "integer" ) {
            return 0;

        // String
        } else if ( schemaObject.type && schemaObject.type == "string" ) {
            return this.visitStringObject(schemaObject);

        // Items
        } else if ( schemaObject.items ) {
            return this.visitItemsObject(schemaObject.items);

        // Properties
        } else if ( schemaObject.properties ) {
            const instance = this;
            const object : {[id: string]: any }= {};
            Object.keys(schemaObject.properties).forEach(key => {
                const property = (schemaObject.properties as any)[key];
                const propertyValue = instance.visitSchemaObject(property);
                object[key] = propertyValue;
            });
            return object;
        }

        return null;
    }

    /**
     * Visit reference
     * @param referenceObject reference to visit
     */
    private visitReferenceObject(referenceName: string) {
        const definitionName = referenceName.substring(("#/definitions/").length);
        const definition = (this._definitions as OpenAPIV2.DefinitionsObject)[definitionName];
        return this.visitSchemaObject(definition);
    }

    /**
     * Visit items object
     * @param items items to visit
     */
    private visitItemsObject(items: OpenAPIV2.ItemsObject) : any {
        
        // Integer
        if ( items.type && items.type == "integer" ) {
            return [ 0 ];

        // String
        } else if ( items.type && items.type == "string" ) {
            const stringObject = this.visitStringObject(items);
            return [ stringObject ];

        // Items
        } else if ( items.items ) {
            const itemsObject = this.visitItemsObject(items.items);
            return [ itemsObject ];

        // Reference
        } else if ( items.$ref ) {
            return [ this.visitReferenceObject(items.$ref) ];

        } else {
            return null;
        }
    }

    /**
     * Visit string object
     * @param stringObject string object to visit
     */
    private visitStringObject(stringObject: OpenAPIV2.SchemaObject) {
        if ( stringObject.example ) {
            return stringObject.example;
        } else if ( stringObject.enum && stringObject.enum.length > 0 ) {
            return stringObject.enum[0];
        } else {
            return "string";
        }
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
     * Identify content type to produce from an operation
     * @param operation operation to read
     */
    private identifyServiceContentType(operation: OpenAPIV2.OperationObject) {
        if ( operation.produces && operation.produces.length > 0) {
            if ( operation.produces.includes("application/json")) {
                return "application/json";
            } else {
                return operation.produces[0];
            }
        } else {
            return "application/txt";
        }
    }
}