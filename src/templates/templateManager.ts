import { v4 } from "uuid";
import { RedisManager } from "./redisManager";

export class TemplateManager {
    private static _instance : TemplateManager;

    public async evaluate(body: string) {
        return await this.useFunctions(body);
    }

    private async useFunctions(body: string) {
        body = body.replace(/UUID\(\)/g, v4())
        body = await this.applyIncrementFunction(body);
        return body;
    }

    private async applyIncrementFunction(body: string) {
        const regex = /Increment\(([a-zA-Z]+)\)/g;
        const matches = regex.exec(body);
        if ( matches ) {
            var value = await RedisManager.instance.getValue(matches[1]);
            if ( !value ) { value = "1"; }
            body = body.replace(regex, value);
            const currentValue = Number.parseInt(value);
            if ( !Number.isNaN(currentValue)) {
                RedisManager.instance.setValue(matches[1], (currentValue+1) + "");
            }
        }
        return body;
    }

    public static get instance() {
        if ( !TemplateManager._instance) {
            TemplateManager._instance = new TemplateManager();
        }
        return TemplateManager._instance;
    }
}