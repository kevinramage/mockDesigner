import * as winston from "winston";
import * as util from "util";
import { XMLUtils } from "./XMLUtils";

/**
 * Class to navigate through a formatted content: JSON, XML, UrlEncoded
 */
export class NavigationUtils {
    

    public static checkMandatoryField(content: object, mandatoryField: string, system: NAVIGATION_SYSTEM) : string{
        winston.debug("NavigationUtils.checkMandatoryField: " + mandatoryField);
        if ( mandatoryField != "" ) {
            const result = NavigationUtils.checkMandatoryFieldPath(content, mandatoryField.split("."), system, "");
            winston.debug("NavigationUtils.checkMandatoryField - Result : " + result);
            return result;
        } else {
            return "";
        }
    }

    public static checkEnumField(content: object, enumField: string, values: string[], system: NAVIGATION_SYSTEM) {
        winston.debug("NavigationUtils.checkEnumField");
        const contentValue = NavigationUtils.getFieldRecursively(content, enumField, system);
        if ( contentValue ) {

            // Array
            if ( typeof contentValue == "object" && contentValue.length) {

                // Check type
                if ( contentValue.length > 0 && typeof contentValue[0] == "string" ) {
                    const contentArray = contentValue as Array<string>;
                    var result = "";
                    contentArray.forEach((element, index) => {
                        if ( !values.includes(element) ) {
                            const elementResult = util.format("%s[%d]", element, index);
                            result = NavigationUtils.concatResult(result, elementResult);
                        }
                    });
                    return result;
                } else if ( contentValue.length == 0 ) {
                    return enumField;
                } else {
                    winston.warn("NavigationUtils.checkEnumField - Impossible to check enum, field is not a string or a string array");
                    return enumField;
                }

            // String
            } else if ( typeof contentValue == "string" ) {
                if ( !values.includes(contentValue)) {
                    return enumField;
                } else {
                    return "";
                }

            // Other type (Array, Object, String)
            } else {
                winston.warn("NavigationUtils.checkEnumField - Impossible to check enum, field is not a string or a string array");
                return enumField;
            }
        } else {
            winston.warn("NavigationUtils.checkEnumField - Impossible to check enum, field not presents");
            return enumField;
        }
    }

    private static checkMandatoryFieldPath(content: any, paths: string[], system: NAVIGATION_SYSTEM, expression: string) : string {
        winston.debug("NavigationUtils.checkMandatoryFieldPath: " + expression);

        // Security
        if ( !paths || paths.length == 0 ) { 
            winston.warn("NavigationUtils.checkMandatoryFieldPath: invalid paths (empty length)");
            return ""; 
        }

        // Get field
        const field = NavigationUtils.getField(content, paths[0], system);
        const newExpression = expression !="" ? expression + "." + paths[0] : paths[0];
        const isFinalField = paths.length == 1;
        winston.debug("NavigationUtils.checkMandatoryFieldPath: isFinalField: " + isFinalField + " - newExpression: " + newExpression);

        if ( !isFinalField && field && typeof field == "object" ) {
            const fields = field as Array<Object>;
            if ( field.length != undefined ) {
                const result = NavigationUtils.checkMandantoryArrayField(fields, paths, system, newExpression);
                winston.debug("NavigationUtils.checkMandatoryFieldPath - Result: " + result);
                return result;
            } else {
                const newPaths = paths.slice(1);
                const result = NavigationUtils.checkMandatoryFieldPath(field, newPaths, system, newExpression);
                winston.debug("NavigationUtils.checkMandatoryFieldPath - Result: " + result);
                return result;
            }
        } else {
            const isMissing = (field == null && isFinalField);
            const result = (isMissing ? newExpression : "");
            winston.debug("NavigationUtils.checkMandatoryFieldPath - Result: " + result);
            return result;
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

    /**
     * Concatenate and format two results
     * @param resultA previous result to concatenate
     * @param resultB next result to concatenate
     */
    public static concatResult(resultA: string, resultB: string) : string {
        winston.debug("NavigationUtils.concatResult: " + resultA + ", " + resultB);
        if ( resultA != "" && resultB != "" )  {
            return resultA + ", " + resultB;
        } else if ( resultA != "")  {
            return resultA;
        }  else {
            return resultB;
        }
    }

    /**
     * Get field from a formatted content
     * When you browse array object, browse all instances of the array
     * @param content content to browse
     * @param field field to search
     * @param system navigation system to use (JSON, XML)
     */
    public static getField(content: any, field: string, system: NAVIGATION_SYSTEM) : any {
        winston.debug("NavigationUtils.getField: " + field);
        if ( system == "JSON") {
            return NavigationUtils.getFieldFromJSON(content, field);
        } else {
            return NavigationUtils.getFieldFromXML(content, field);
        }
    }

    public static getFieldRecursively(content: any, path: string, system: NAVIGATION_SYSTEM) : any {
        winston.debug("NavigationUtils.getFieldRecursively: " + path);
        const index = path.indexOf(".");
        if ( index != -1 ) {
            const rootPath = path.substr(0, index);
            const remainingPath = path.substr(index+1);
            const newContent = this.getField(content, rootPath, system);

            // Array
            if ( newContent != null && typeof newContent == "object" && newContent.length ) {
                var results : Array<string> = [];
                const array = newContent as Array<object>;
                array.forEach(element => {
                    const elementContent = NavigationUtils.getFieldRecursively(element, remainingPath, system);
                    
                    // Array
                    if ( elementContent != null && typeof elementContent == "object" && elementContent.length ) {
                        results = results.concat(element as Array<string>);

                    // String
                    } else if ( elementContent != null && typeof elementContent == "string" ) {
                        results.push(elementContent);
                    }
                });
                return results;

            // Object
            } else if ( newContent != null && typeof newContent == "object" ) {
                return NavigationUtils.getFieldRecursively(newContent, remainingPath, system);
            } else {
                return null;
            }
        } else {
            return this.getField(content, path, system);
        }
    }

    /**
     * Return the content of search field or null if not found
     * @param content content to browse
     * @param field field to search
     */
    public static getFieldFromJSON(content: any, field: string) {
        winston.debug("NavigationUtils.getFieldFromJSON: " + field);
        if ( content && content[field]) {
            const result = content[field];
            winston.debug("NavigationUtils.getFieldFromJSON - Result : " + result);
            return result;
        } else {
            return null;
        }
    }

    /**
     * Return the content of search field or null if not found
     * @param content content to browse
     * @param field field to search
     */
    public static getFieldFromXML(content: object, field: string) {
        winston.debug("NavigationUtils.getFieldFromXML: " + field);
        return XMLUtils.getNodeValue(content, [ field ]);
    }
 
}

export type NAVIGATION_SYSTEM = "JSON" | "XML";