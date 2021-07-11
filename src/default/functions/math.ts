import { format } from "util";
import { v4 } from "uuid";
import { RedisManager } from "types/RedisManager";

export class MathUtils {

    public static UUID() {
        return v4();
    }

    
    private static _counters : { [key: string] : number } = {};
    public static increment(args: any[]) {
        return new Promise<number>(async (resolve) => {
            const objectName = args.length > 1 ? args[1] : "";
            const persist = args.length > 2 && args[2] == "true" ? true : false;
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

    public static random(args: any[]) {
        const maxValue = args.length > 1 ? args[1] as string : "";
        return Math.round(Math.random() * Number.parseInt(maxValue));
    }

    public static parse(args: any[]) {
        const content = args.length > 1 ? args[1] as string : "";
        return Number.parseInt(content);
    }
}

function register(functions: {[name: string]: Function}) {
    functions["Math.UUID"] = MathUtils.UUID;
    functions["Math.Increment"] = MathUtils.increment;
    functions["Math.RandomInteger"] = MathUtils.random;
    functions["Math.UniqueID"] = MathUtils.uniqueID;
    functions["Math.Parse"] = MathUtils.parse;
}