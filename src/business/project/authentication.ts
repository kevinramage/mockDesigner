import { Context } from "../../business/core/context";

export class Authentication {

    public authenticate(context: Context) : boolean {
        return true;
    }

    protected sendAuthenticationRequired(context: Context) {
        context.response.status(401);
        context.response.send("Authentication required");
        context.response.end();
    }

    protected sendAccessForbidden(context: Context) {
        context.response.status(401);
        context.response.send("Access forbidden");
        context.response.end();
    }

    public toObject() {
        return {};
    }
}