import * as winston from "winston";
import * as util from "util";
import { Context } from "../context";
import { TemplateManager } from "./templateManager";
import { Condition } from "../condition";

export class ConditionEvaluator {

    public async evaluateConditions(context: Context, conditions: Condition[]) {
        winston.debug("ConditionEvaluator.evaluateConditions");
        const instance = this;
        var result = true;
        for ( var conditionKey in conditions) {
            const evaluation = await instance.evaluateCondition(context, conditions[conditionKey]);
            result = result && evaluation;
        }
        winston.info("ConditionEvaluator.evaluateConditions - Evaluation: " + result);
        return result;
    }

    private async evaluateCondition(context: Context, condition: Condition) {
        winston.debug("ConditionEvaluator.evaluateCondition");
        var result;
        switch ( condition.operation ) {
            case "EQUALS":
                result = await this.evaluateEqualsCondition(context, condition);
                return result;

            case "NOT_EQUALS":
                result = await this.evaluateNotEqualsCondition(context, condition);
                return result;

            case "MATCHES":
                result = await this.evaluateMatchesCondition(context, condition);
                return result;

            case "NOT_MATCHES":
                result = await this.evaluateNotMatchesCondition(context, condition);
                return result;

            case "IN":
                result = await this.evaluateInCondition(context, condition);
                return result;

            case "NOT_IN":
                result = await this.evaluateNotInCondition(context, condition);
                return result;

            case "RANGE":
                result = await this.evaluateRangeCondition(context, condition);
                return result;

            default:
                winston.warn(util.format("ConditionEvaluator.evaluateCondition - Invalid operation '%s'", condition.operation));
                return false;
        }
    }

    private async evaluateEqualsCondition(context: Context, condition: Condition) {
        winston.debug("ConditionEvaluator.evaluateEqualsCondition");
        const leftOperand = await TemplateManager.instance.evaluate(condition.leftOperand, context);
        const rightOperand = await TemplateManager.instance.evaluate(condition.rightOperand, context);
        return leftOperand == rightOperand;
    }

    private async evaluateNotEqualsCondition(context: Context, condition: Condition) {
        winston.debug("ConditionEvaluator.evaluateNotEqualsCondition");
        const leftOperand = await TemplateManager.instance.evaluate(condition.leftOperand, context);
        const rightOperand = await TemplateManager.instance.evaluate(condition.rightOperand, context);
        return leftOperand != rightOperand;
    }

    private async evaluateMatchesCondition(context: Context, condition: Condition) {
        winston.debug("ConditionEvaluator.evaluateMatchesCondition");
        const leftOperand = await TemplateManager.instance.evaluate(condition.leftOperand, context);
        // Instanciate regex
        try {
            const regex = new RegExp(condition.rightOperand);
            return regex.test(leftOperand);

        } catch {
            winston.warn(util.format("ConditionEvaluator.evaluateMatchesCondition - Invalid regex '%s'", condition.rightOperand));
            return false;
        }
    }

    private async evaluateNotMatchesCondition(context: Context, condition: Condition) {
        winston.debug("ConditionEvaluator.evaluateNotMatchesCondition");
        const leftOperand = await TemplateManager.instance.evaluate(condition.leftOperand, context);

        // Instanciate regex
        try {
            const regex = new RegExp(condition.rightOperand);
            return !regex.test(leftOperand);

        } catch {
            winston.warn(util.format("ConditionEvaluator.evaluateNotMatchesCondition - Invalid regex '%s'", condition.rightOperand));
            return false;
        }
    }

    private async evaluateInCondition(context: Context, condition: Condition) {
        winston.debug("ConditionEvaluator.evaluateInCondition");
        const leftOperand = await TemplateManager.instance.evaluate(condition.leftOperand, context);
        const values : string[] = [];
        const textList = condition.rightOperand.split(";");
        for ( var i = 0; i < textList.length; i++) {
            const value = await TemplateManager.instance.evaluate(textList[i], context);
            values.push(value);
        }
        return values.indexOf(leftOperand) != -1;
    }

    private async evaluateNotInCondition(context: Context, condition: Condition) {
        winston.debug("ConditionEvaluator.evaluateNotInCondition");
        const leftOperand = await TemplateManager.instance.evaluate(condition.leftOperand, context);
        const values : string[] = [];
        const textList = condition.rightOperand.split(";");
        for ( var i = 0; i < textList.length; i++) {
            const value = await TemplateManager.instance.evaluate(textList[i], context);
            values.push(value);
        }
        return values.indexOf(leftOperand) == -1;
    }

    private async evaluateRangeCondition(context: Context, condition: Condition) {
        winston.debug("ConditionEvaluator.evaluateRangeCondition");
        const REGEX_NUMBER = "^[0-9]+$";
        const SEPARATOR = "...";
        const leftOperand = await TemplateManager.instance.evaluate(condition.leftOperand, context);
        const index = condition.rightOperand.indexOf(SEPARATOR);
        if ( index > -1 ) {
            const minTextValue = condition.rightOperand.substr(0, index);
            const maxTextValue = condition.rightOperand.substr(index + SEPARATOR.length);
            const minValue = Number.parseInt(minTextValue.trim());
            const maxValue = Number.parseInt(maxTextValue.trim());
            if ( !isNaN(minValue) && !isNaN(maxValue)) {
                const isNumberValue = new RegExp(REGEX_NUMBER).test(leftOperand);
                if ( isNumberValue ) {
                    const leftOperandValue = Number.parseInt(leftOperand);
                    return leftOperandValue >= minValue && leftOperandValue <= maxValue;
                } else {
                    return false;
                }
            } else if (isNaN(minValue)) {
                winston.warn(util.format("ConditionEvaluator.evaluateRangeCondition - Invalid range expression '%s', '%s' is not a number", condition.rightOperand, minTextValue));
                return false;
            } else {
                winston.warn(util.format("ConditionEvaluator.evaluateRangeCondition - Invalid range expression '%s', '%s' is not a number", condition.rightOperand, maxTextValue));
                return false;
            }
        } else {
            winston.warn(util.format("ConditionEvaluator.evaluateRangeCondition - Invalid range expression '%s', missing separator %s", condition.rightOperand, SEPARATOR));
            return false;
        }
    }
}