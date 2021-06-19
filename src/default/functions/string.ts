import { Context } from "types/Context";

export class StringUtils {

    public static upperCase(args: any[]) {
        const content = args.length > 1 ? args[1] as string : "";
        if (content) {
            return content.toUpperCase();
        } else {
            return null;
        }
    }

    public static lowerCase(args: any[]) {
        const content = args.length > 1 ? args[1] as string : "";
        if (content) {
            return content.toLowerCase();
        } else {
            return null;
        }
    }

    public static concat(args: any[]) {
        const strings = args.slice(1) as string[];
        if (strings) {
            return strings.reduce((a, b) => { return a.concat(b); });
        } else {
            return null;
        }
    }

    public static randomString(args: any[]) {
        const context = args[0] as Context;
        const list = context.dataManager.dataSources["words"] as string[];
        const index = Math.round(Math.random() * list.length);
        return list[index];
    }
}

function register(functions: {[name: string]: Function}) {
    functions["String.Concat"] = StringUtils.concat;
    functions["String.UpperCase"] = StringUtils.upperCase;
    functions["String.LowerCase"] = StringUtils.lowerCase;
    functions["String.RandomString"] = StringUtils.randomString;
}