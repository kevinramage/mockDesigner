import { Context } from "../context";
import { NavigationUtils } from "./NavigationUtils";

export class ValidationUtils {

    public static validate(context: Context, mandatoriesFields: string[]) {

        var result = "";
        mandatoriesFields.forEach(mandatoryField => {
            const newResult = NavigationUtils.checkMandatoryField(context.request?.body, mandatoryField, "JSON");
            if ( newResult != "" ) {
                result = NavigationUtils.concatResult(result, newResult);
            }
        });

        return result;
    }
}