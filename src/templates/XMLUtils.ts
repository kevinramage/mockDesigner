import * as winston from "winston";
import * as util from "util";

export class XMLUtils {

    public static getValue(element: any, path: string) {
        winston.debug("XMLUtils.getValue: " + path);
        const subPaths = path.split(".");
        var currentElement = element;
        currentElement = XMLUtils.navigateThroughtXMLNode(currentElement, "soapenv:Envelope");
        currentElement = XMLUtils.navigateThroughtXMLNode(currentElement, "soapenv:Body");
        subPaths.forEach(subPath => {
            const element = XMLUtils.navigateThroughtXMLNode(currentElement, subPath);
            if ( element ) {
                currentElement = element;
            } else {
                const message = util.format("Invalid path expression. Impossible to find sub expression %s", path);
                winston.warn("XMLUtils.getValue - " + message);
                return null;
            }
        });
        if ( currentElement.length ) {
            return currentElement[0];
        } else {
            return currentElement;
        }
    }

    public static exists(element: any, path: string) : boolean {
        winston.debug("XMLUtils.exists");
        var exists = true;
        if ( !element || !path ) { return false; }
        const subPaths = path.split(".");
        var currentElement = element;
        currentElement = XMLUtils.navigateThroughtXMLNode(currentElement, "soapenv:Envelope");
        if (!currentElement) { return false; }
        currentElement = XMLUtils.navigateThroughtXMLNode(currentElement, "soapenv:Body");
        if (!currentElement) { return false; }
        subPaths.forEach(subPath => {
            const element = XMLUtils.navigateThroughtXMLNode(currentElement, subPath);
            if ( element ) {
                currentElement = element;
            } else {
                exists = false;
                return;
            }
        });
        return (exists && currentElement.length && currentElement.length > 0);
    }

    private static navigateThroughtXMLNode(element: any, path: string) {
        //winston.debug("XMLUtils.navigateThrough");
        var subElement;
        if ( element.length ) {
            subElement = element.find((elt : {[id: string]: any}) => { return elt[path];});
            if ( subElement ) {
                subElement = subElement[path];
            } else {
                return null;
            }
        } else {
            subElement = element[path];
        }
        if ( subElement ) {
            return subElement;
        } else {
            return null;
        }
    }
}