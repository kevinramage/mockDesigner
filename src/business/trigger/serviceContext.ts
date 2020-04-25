import * as winston from "winston";
import { IServiceTrigger } from "./serviceTrigger";

export class ServiceContext implements IServiceTrigger {

    public generate(tab: string) {
        return "";
    }
}