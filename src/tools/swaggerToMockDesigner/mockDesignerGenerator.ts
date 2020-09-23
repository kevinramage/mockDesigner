
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
        content += "services:\n";
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
        content += this.generateResponse(service);
        content += "\n";

        return content;
    }

    /**
     * Generate response from mock designer code
     * @param service service to generate
     */
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

        return content;
    }
}