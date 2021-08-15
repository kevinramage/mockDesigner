import { OptionsManager } from "../core/optionsManager";
import { Request, Response } from "express";
import { ServiceBase } from "./base";

export class OptionService extends ServiceBase {

    public static getAllOptions(req: Request, res: Response) {
        OptionService.sendData(res, OptionsManager.instance.options);
    }

    public static getOption(req: Request, res: Response) {
        const key = req.query.key as string | undefined;
        if (key) {
            const option = OptionsManager.instance.options[key];
            if (option) {
                OptionService.sendData(res, option);
            } else {
                OptionService.sendResourceNotFound(res, "Option");
            }
        } else {
            OptionService.sendInvalidRequest(res, "Query key must be defined");
        }
    }

    public static updateOption(req: Request, res: Response) {
        const key = req.body.key as string | undefined;
        const value = req.body.value as string | undefined;
        if (key && value) {
            if (OptionsManager.instance.options[key]) {
                OptionsManager.instance.options[key] = value;
                const isSaved = OptionsManager.instance.saveOptions();
                if (isSaved) {
                    OptionService.sendData(res, value);
                } else {
                    OptionService.sendInternalError(res);
                }
            } else {
                OptionService.sendResourceNotFound(res, "Option");
            }
        } else if (!key) {
            OptionService.sendInvalidRequest(res, "Option key must be defined");
        } else {
            OptionService.sendInvalidRequest(res, "Option value must be defined");
        }
    }

    public static resetOption(req: Request, res: Response) {
        OptionsManager.instance.reset();
        const isSaved = OptionsManager.instance.saveOptions();
        if (isSaved) {
            OptionService.sendData(res, OptionsManager.instance.options);
        } else {
            OptionService.sendInternalError(res);
        }
    }
}