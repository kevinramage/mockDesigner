import { Context } from "../../types/Context";

export class StringUtils {

    public static upperCase(context: Context, contentArg: string) {
        const content = contentArg || "";
        if (content) {
            return content.toUpperCase();
        } else {
            return null;
        }
    }

    public static lowerCase(context: Context, contentArg: string) {
        const content = contentArg || "";
        if (content) {
            return content.toLowerCase();
        } else {
            return null;
        }
    }

    public static concat(context: Context, args: string[]) {
        const strings = args || [];
        if (strings) {
            return strings.reduce((a, b) => { return a.concat(b); });
        } else {
            return null;
        }
    }
}

function register(functions: {[name: string]: Function}) {
    functions["String.Concat"] = StringUtils.concat;
    functions["String.UpperCase"] = StringUtils.upperCase;
    functions["String.LowerCase"] = StringUtils.lowerCase;
}