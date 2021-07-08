import { validate } from "fast-xml-parser";

export class ContentTypeDetection {

    public static detect(content: string) {
        if (ContentTypeDetection.isXML(content)) {
            return "application/xml";
        } else if (ContentTypeDetection.isJSON(content)) {
            return "application/json";
        } else {
            return "text/plain";
        }
    }

    private static isJSON(content: string) {
        try {
            JSON.parse(content);
            return true;
        } catch {
            return false;
        }
    }

    private static isXML(content: string) {
        return validate(content) === true;
    }
}