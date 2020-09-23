
import { format } from "util";
import { Service } from "./business/service";
import { Response } from "./business/response";

export class MockDesignerGenerator {

    /**
     * Generate mock designer code from services 
     * @param name project's name
     * @param services services to generate
     */
    public generate(name: string, services: Service[]) {
        const files : { [ path: string] : string } = {};

        // Generate main code
        files["code/" + name + ".yml" ] = this.generateMockDesignerCode(name, services);

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

    /**
     * Generate mock designer code from services
     * @param name project's name
     * @param services services to generate
     */
    private generateMockDesignerCode(name: string, services: Service[]) {
        const instance = this;
        var content = "";

        content += format("name: %s\n", name);
        content += format("services:\n");
        services.forEach(service => {
            content += instance.generateService(service);
        });

        return content;
    }

    /**
     * Generate mock designer code from a service
     * @param service service to generate
     */
    private generateService(service: Service) {
        var content = "";

        // Service
        content += format("- name: %s\n", service.name);
        content += format("  method: %s\n", service.method.toUpperCase());
        content += format("  path: %s\n", service.path);

        // Response
        content += this.generateResponses("  ", service);
        content += "\n";

        return content;
    }

    /**
     * Generate mock designer code for responses from a service
     * @param tab tabulation to apply
     * @param service service to generate
     */
    private generateResponses(tab: string, service: Service) {
        var content = "";

        // Response
        content += format("%sresponse:\n", tab);

        // Generate errors responses
        content += this.generateErrorResponses(tab + "  ", service);

        // Generate default response
        content += this.generateDefaultResponse(tab + "  ", service);

        return content;
    }

    private generateErrorResponses(tab: string, service: Service) {
        const instance = this;
        var content = "";

        const errorResponses = service.errorsResponse;
        if ( errorResponses.length > 0 ) {
            content += format("%sbehaviours:\n", tab);
            errorResponses.forEach(res => {
                content += instance.generateErrorResponse(tab, service, res);
            });
        }

        return content;
    }

    private generateErrorResponse(tab : string, service: Service, response: Response) {
        var content = "";

        content += format("%s- name: ERROR_%d\n", tab, response.code);
        content += format("%s  actions:\n", tab);
        content += this.generateResponseMessage(tab + "  ", service, response);

        return content;
    }

    /**
     * Generate mock designer code for response from a service
     * @param tab tabulation to apply
     * @param service service to generate
     */
    private generateDefaultResponse(tab: string, service: Service) {

        var content = "";

        if ( service.responses.length > 0 ) {

            const defaultResponse = service.defaultResponse;
            const response = defaultResponse || service.responses[0];
            content += format("%striggers:\n", tab);
            content += format("%s- type: none\n", tab);
            content += format("%s  actions:\n", tab);
            content += this.generateResponseMessage(tab + "  ", service, response);
        }

        return content;
    }

    private generateResponseMessage(tab: string, service: Service, response: Response) {
        var content = "";

        content += format("%s- type: message\n", tab);
        content += format("%s  status: %d \n", tab, response.code);
        content += this.generateResponseMessageBody(tab + "  ", service, response);
        if ( response.contentType != "") {
            content += format("%s  headers: \n", tab);
            content += format("%s    Content-Type: %s\n", tab, response.contentType);
        }

        return content;
    }

    private generateResponseMessageBody(tab: string, service: Service, response: Response) {
        var content = "";

        if ( response.isIncludedInExternalFile ) {
            content += format("%sbodyFile: %s\n", tab, response.getExternalFileName(service.name));
        } else {
            var body = "";
            if ( response.content ) {
                body = format("\"%s\"", JSON.stringify(response.content).replace(/\"/g, "\\\""));
            }
            content += format("%sbody: %s\n", tab, body)
        }

        return content;
    }
}