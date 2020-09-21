import * as winston from "winston";
import { Context } from "../context";
import { NavigationUtils } from "./navigationUtils";
import { EnumField } from "../enumField";

/**
 * Validation class use to operation some checks on incoming requests
 * - Check mandatory fields
 * - Check enum field
 */
export class ValidationUtils {

    /**
     * Validate a request to check mandatories fields and enum fields
     * @param context context to use for the validation
     * @param mandatoriesFields mandatories fields to check
     * @param enumFields enum fields to check
     */
    public static validate(context: Context, mandatoriesFields: string[], enumFields: EnumField[]) {
        winston.debug("ValidationUtils.validate");
        var result = "";

        // Mandatories fields
        mandatoriesFields.forEach(mandatoryField => {
            const newResult = NavigationUtils.checkMandatoryField(context.request?.body, mandatoryField, "JSON");
            result = NavigationUtils.concatResult(result, newResult);
        });

        // Enum fields
        enumFields.forEach(enumField => {
            const newResult = NavigationUtils.checkEnumField(context.request?.body, enumField.field, enumField.values, "JSON");
            result = NavigationUtils.concatResult(result, newResult);
        });

        return result;
    }
}