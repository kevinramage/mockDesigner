import * as fs from "fs";
import * as yaml from "yaml";
import { program } from "commander";
import { IMock } from "../interface/mock";
import { IMockService } from "../interface/mockService";
import { IMockResponse } from "../interface/mockResponse";
import { ISwagger } from "./swagger/interface/openAPI3/openAPI";
import { IPathItem } from "./swagger/interface/openAPI3/pathItem";
import { IService } from "./swagger/interface/mockDesigner/service";
import { IOperation } from "./swagger/interface/openAPI3/operation";
import { IMediaType } from "./swagger/interface/openAPI3/mediaType";
import { IExample } from "./swagger/interface/openAPI3/example";
import { IResponse } from "./swagger/interface/openAPI3/response";
import { IMockTrigger } from "interface/mockTrigger";
import { IMockMessageAction } from "interface/mockMessageAction";

export class SwaggerToMockDesigner {

    public async run() {

        // Configure program
        program
            .option('-p, --path <path>', 'project path', '');
        
        program.description("Tool to generate mocks from descriptions");
        program.version("1.0.0");
        program.parse(process.argv);

        // Read swagger
        const swagger = this.readSwagger(program.path);
        const services = this.generateServices(swagger);
        
    }

    private readSwagger(path: string) {
        console.info(path);
        const buffer = fs.readFileSync(path);
        const body = buffer.toString();
        return yaml.parse(body) as ISwagger;
    }

    private generateServices(swagger : ISwagger) {
        const services :any[] = [];
        const instance = this;
        Object.keys(swagger.paths).forEach((pathKey:string) => {
            const pathObject = swagger.paths[pathKey];
            Object.keys(pathObject).forEach((methodKey: string) => {
                if ( methodKey == "get" || methodKey == "post" || methodKey == "put" || methodKey == "delete" ) {
                    const methodObject = pathObject[methodKey];
                    instance.generateService(pathKey, methodKey, methodObject as IOperation);
                }
            });
        });

        return services;
    }

    private generateService(path: string, method: string, operation: IOperation) {
        const service : IService = {};
        service.path = this.transformPath(path);
        service.method = method.toUpperCase();
        service.name = operation.operationId;
        service.response = this.generateResponse(operation)
        return service;
    }

    private generateResponse(operation: IOperation) {
        var result : any = null
        Object.keys(operation.responses).forEach(responseKey => {
            const response = operation.responses[responseKey] as IResponse;
            Object.keys(response.content).forEach(contentKey => {
                const mediaType = response.content[contentKey];
                Object.keys(mediaType.examples).forEach(exampleKey => {
                    result = mediaType.examples[exampleKey].value
                });
            });
        });
        return result;
    }

    private generateMock(name: string, services: IService[]) {
        const mock : IMock = { name: name, services: []};
        mock.services = services.map(service => {
            const mockService : IMockService = {
                name: service.name as string,
                method: service.method,
                path: service.path as string,
                response: { behaviours: [], triggers: [] }
            };
            const trigger : IMockTrigger = { type: "none", actions: []};
            //const messageAction : IMockMessageAction = { type: "message", bodyFile: ""}

            mockService.response.triggers.push(trigger);
            return mockService;
        });
        return mock;
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
}

new SwaggerToMockDesigner().run();