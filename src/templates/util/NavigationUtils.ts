import * as winston from "winston";
import * as util from "util";
import { XMLUtils } from "./XMLUtils";

export class NavigationUtils {
    

    public static checkMandatoryField(content: object, mandatoryField: string, system: NAVIGATION_SYSTEM) : string{
        winston.debug("NavigationUtils.checkMandatoryField: " + mandatoryField);
        if ( mandatoryField != "" ) {
            return NavigationUtils.checkMandatoryFieldPath(content, mandatoryField.split("."), system, "");
        } else {
            return "";
        }
    }

    private static checkMandatoryFieldPath(content: any, paths: string[], system: NAVIGATION_SYSTEM, expression: string) : string {
        winston.debug("NavigationUtils.checkMandatoryFieldPath: " + expression);

        // Security
        if ( paths.length == 0 ) { return ""; }

        // Get field
        const field = NavigationUtils.getField(content, paths[0], system);
        const newExpression = expression !="" ? expression + "." + paths[0] : paths[0];
        const isFinalField = paths.length == 1;
        /*
        console.info("FieldPath");
        console.info("Paths: " + paths);
        console.info("Path0: " + paths[0]);
        console.info("Path.length: " + paths.length);
        console.info("IsFinal:" + isFinalField);
        console.info(field);
        */

        if ( !isFinalField && field && typeof field == "object" ) {
            const fields = field as Array<Object>;
            if ( field.length != undefined ) {
                return NavigationUtils.checkMandantoryArrayField(fields, paths, system, newExpression);
            } else {
                const newPaths = paths.slice(1);
                return NavigationUtils.checkMandatoryFieldPath(field, newPaths, system, newExpression);
            }
        } else {
            // Missing
            // - Field undefined && isFinalField

            /*
            console.info("IsMissing");
            console.info(field);
            console.info(isFinalField);
            console.info(newExpression);
            */
            const isMissing = (field == null && isFinalField);
            return isMissing ? newExpression : "";
        }
    }

    private static checkMandantoryArrayField(fields: Array<object>, paths: string[], system: NAVIGATION_SYSTEM, path: string ) : string {
        winston.debug("NavigationUtils.checkMandantoryArrayField - Length: " + fields.length);
        var result = "";
        for ( var i = 0; i < fields.length; i++) {
            var newExpression = util.format("%s[%d]", path, i);
            const newPaths = paths.slice(1);
            const fieldResult = NavigationUtils.checkMandatoryFieldPath(fields[i], newPaths, system, newExpression);
            if ( fieldResult ) {
                result = NavigationUtils.concatResult(result, fieldResult);
            }
        }
        return result;
    }

    public static concatResult(resultA: string, resultB: string) : string {
        if ( resultA != "" )  {
            return resultA + ", " + resultB;
        } else {
            return resultB;
        }
    }

    public static getField(content: any,  field: string, system: NAVIGATION_SYSTEM) : any {
        if ( system == "JSON") {
            return NavigationUtils.getFieldFromJSON(content, field);
        } else {
            return NavigationUtils.getFieldFromXML(content, field);
        }
    }

    /**
     * Return the content of search field or null if not found
     * @param content content to browser
     * @param field field to search
     */
    public static getFieldFromJSON(content: any, field: string) {
        if ( content && content[field]) {
            return content[field];
        } else {
            return null;
        }
    }

    public static getFieldFromXML(content: object, field: string) {
        return XMLUtils.getNodeValue(content, [ field ]);
    }
 
}

export type NAVIGATION_SYSTEM = "JSON" | "XML";