export class DateUtils {
    public static currentDate() {
        return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    }
}

function register(functions: {[name: string]: Function}) {
    functions["Date.CurrentDate"] = DateUtils.currentDate;
}