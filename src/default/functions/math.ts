import { format } from "util";
import { Context } from "../../types/Context";
import { RedisManager } from "../../types/RedisManager";

export class MathUtils {
    
    private static _counters : { [key: string] : number } = {};
    public static increment(context: Context, objectNameArg: string, persistArg: string) {
        return new Promise<number>(async (resolve) => {
            const objectName = objectNameArg ? objectNameArg : "";
            const persist = persistArg ? (persistArg.toLowerCase() == "true") : false;
            if (persist) {
                const increment = await MathUtils.incrementPersist(objectName);
                resolve(increment);
            } else {
                const increment = MathUtils.incrementLocal(objectName);
                resolve(increment);
            }
        });
    }

    private static incrementLocal(objectName: string) {
        let counter = 1;
        if (MathUtils._counters[objectName]) {
            counter = MathUtils._counters[objectName]
        }
        MathUtils._counters[objectName] = counter + 1;
        return counter;
    }

    private static incrementPersist(objectName: string) {
        return new Promise<number>((resolve) => {
            const value = RedisManager.instance.increment(format("__inc_%s", objectName));
            resolve(value);
        });
    }

    public static uniqueID() {
        const id = new Date().toISOString().replace(/\-/g, "").replace(/:/g, "")
        .replace(/\./g, "").replace('T', '').replace('Z', '');
        return Number.parseInt(id);
    }
    
    public static parse(context: Context, contentArg: string) {
        const content = contentArg ? contentArg : "";
        return Number.parseInt(content);
    }
}

function register(functions: {[name: string]: Function}) {
    functions["Math.Increment"] = MathUtils.increment;
    functions["Math.UniqueID"] = MathUtils.uniqueID;
    functions["Math.Parse"] = MathUtils.parse;
}