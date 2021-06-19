import { Context } from "types/Context";

export class BusinessFunction {
    public static requestIdentifier(args: any[]) {
        const context = args[0] as Context;
        return context.request.header("reqId") as string || null;
    }
}

function register(functions: {[key: string]: Function}) {
    functions["Business.RequestId"] = BusinessFunction.requestIdentifier;
}