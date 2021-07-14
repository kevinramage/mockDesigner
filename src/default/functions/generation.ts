import { format } from "util";
import { v1, v4 } from "uuid";
import { createHmac } from 'crypto';
import { DataManager } from "../../types/DataManager";
import { Context } from "../../types/Context";

export class GenerationUtils {

    public static generateInteger(context: Context, maxArg: number) {
        const max = maxArg ? maxArg : 10;
        return Math.round(Math.random() * max);
    }

    public static generateFloat(context: Context, maxArg: number) {
        const max = maxArg ? maxArg : 10;
        return Math.random() * max;
    }

    public static generateHexa(context: Context, lengthArg : number) {
        const length = lengthArg ? lengthArg : 1;
        if (length < 0) { throw new Error("Hexa: Invalid length: " + length)}
        let result = "";
        for (var i = 0; i < length; i++) {
            result += GenerationUtils.hexa(context);
        }
        return result;
    }

    private static hexa(context: Context) {
        const number = GenerationUtils.generateInteger(context, 15);
        if (number > 9) {
            const code = 'F'.charCodeAt(0) - (15 - number);
            return String.fromCharCode(code);
        } else {
            return number.toString();
        }
    }

    public static generateString(context: Context) {
        const source = context.dataManager.dataSources["words"] as string[];
        const index = GenerationUtils.generateInteger(context, source.length -1);
        return source[index];
    }

    public static generateFirstName(context: Context) {
        const source = context.dataManager.dataSources["firstname"] as string[];
        const index = GenerationUtils.generateInteger(context, source.length -1);
        return source[index];
    }

    public static generateLastName(context: Context) {
        const source = context.dataManager.dataSources["lastname"] as string[];
        const index = GenerationUtils.generateInteger(context, source.length -1);
        return source[index];
    }

    public static generateMail(context: Context) {
        const source = context.dataManager.dataSources["email"] as string[];
        const index = GenerationUtils.generateInteger(context, source.length -1);
        return source[index];
    }

    public static generateFileName(context: Context) {
        const source = context.dataManager.dataSources["fileName"] as string[];
        const index = GenerationUtils.generateInteger(context, source.length -1);
        return source[index];
    }

    public static generatePhoneNumber_FR(context: Context, phoneFormatArg: string) {
        let phoneFormat = phoneFormatArg ? phoneFormatArg : "dd-dd-dd-dd-dd";
        phoneFormat = phoneFormat.replace(/dd/g, "%s");
        const number1 = "0" + (GenerationUtils.generateInteger(context, 8) + 1);
        const number2 = GenerationUtils.generateInteger(context, 99).toString().padStart(2, "0");
        const number3 = GenerationUtils.generateInteger(context, 99).toString().padStart(2, "0");;
        const number4 = GenerationUtils.generateInteger(context, 99).toString().padStart(2, "0");;
        const number5 = GenerationUtils.generateInteger(context, 99).toString().padStart(2, "0");;
        try {
            return format(phoneFormat, number1, number2, number3, number4, number5);
        } catch {
            return "00-00-00-00-00";
        }
    }

    public static generatePhoneNumber_US(context: Context, phoneFormatArg: string) {
        let phoneFormat = phoneFormatArg ? phoneFormatArg : "ddd-ddd-dddd";
        phoneFormat = phoneFormat.replace(/dddd/g, "%s");
        phoneFormat = phoneFormat.replace(/ddd/g, "%s");
        const number1 = GenerationUtils.generateInteger(context, 999).toString().padStart(3, "0");
        const number2 = GenerationUtils.generateInteger(context, 999).toString().padStart(3, "0");;
        const number3 = GenerationUtils.generateInteger(context, 9999).toString().padStart(4, "0");;
        try {
            return format(phoneFormat, number1, number2, number3);
        } catch {
            return "000-000-0000";
        }
    }

    public static generatePhoneNumber_UK(context: Context, phoneFormatArg: string) {
        let phoneFormat = phoneFormatArg ? phoneFormatArg : "ddddd-dddddd";
        phoneFormat = phoneFormat.replace(/dddddd/g, "%s");
        phoneFormat = phoneFormat.replace(/ddddd/g, "%s");
        const number1 = GenerationUtils.generateInteger(context, 99999).toString().padStart(5, "0");
        const number2 = GenerationUtils.generateInteger(context, 999999).toString().padStart(6, "0");;
        try {
            return format(phoneFormat, number1, number2);
        } catch {
            return "00000-000000";
        }
    }

    public static generateIPV4(context: Context) {
        const number1 = GenerationUtils.generateInteger(context, 255);
        const number2 = GenerationUtils.generateInteger(context, 255);
        const number3 = GenerationUtils.generateInteger(context, 255);
        const number4 = GenerationUtils.generateInteger(context, 255);
        return format("%d.%d.%d.%d", number1, number2, number3, number4);
    }

    public static generateIPV6(context: Context) {
        const number1 = GenerationUtils.generateHexa(context, 4);
        const number2 = GenerationUtils.generateHexa(context, 4);
        const number3 = GenerationUtils.generateHexa(context, 4);
        const number4 = GenerationUtils.generateHexa(context, 4);
        const number5 = GenerationUtils.generateHexa(context, 4);
        const number6 = GenerationUtils.generateHexa(context, 4);
        const number7 = GenerationUtils.generateHexa(context, 4);
        const number8 = GenerationUtils.generateHexa(context, 4);
        return format("%s:%s:%s:%s:%s:%s:%s:%s", number1, number2, number3, number4, number5, number6, number7, number8);
    }

    public static generateMacAddress(context: Context) {
        const number1 = GenerationUtils.generateHexa(context, 2);
        const number2 = GenerationUtils.generateHexa(context, 2);
        const number3 = GenerationUtils.generateHexa(context, 2);
        const number4 = GenerationUtils.generateHexa(context, 2);
        const number5 = GenerationUtils.generateHexa(context, 2);
        const number6 = GenerationUtils.generateHexa(context, 2);
        return format("%s-%s-%s-%s-%s-%s", number1, number2, number3, number4, number5, number6);
    }

    public static generateMD5(context: Context) {
        console.info("generateMD5");
        let content = GenerationUtils.generateString(context);
        console.info("generateMD5-content");
        const secret = GenerationUtils.generateString(context);
        console.info("generateMD5-secret");
        const hash = createHmac('md5', secret);
        hash.update(content);
        return hash.digest("hex").toString();
    }

    public static generateSHA1(context: Context) {
        let content = GenerationUtils.generateString(context);
        const secret = GenerationUtils.generateString(context);
        const hash = createHmac('sha1', secret);
        hash.update(content);
        return hash.digest("hex").toString();
    }

    public static generateSHA256(context: Context) {
        let content = GenerationUtils.generateString(context);
        const secret = GenerationUtils.generateString(context);
        const hash = createHmac('sha256', secret);
        hash.update(content);
        return hash.digest("hex").toString();
    }


    public static generateUUIDV1() { return v1(); }
    public static generateUUIDV4() { return v4(); }
}

function register(functions: {[name: string]: Function}) {
    functions["Generation.Integer"] = GenerationUtils.generateInteger;
    functions["Generation.Float"] = GenerationUtils.generateFloat;
    functions["Generation.Hexa"] = GenerationUtils.generateHexa;
    functions["Generation.String"] = GenerationUtils.generateString;
    functions["Generation.FirstName"] = GenerationUtils.generateFirstName;
    functions["Generation.LastName"] = GenerationUtils.generateLastName;
    functions["Generation.Mail"] = GenerationUtils.generateMail;
    functions["Generation.FileName"] = GenerationUtils.generateFileName;
    functions["Generation.PhoneNumber_FR"] = GenerationUtils.generatePhoneNumber_FR;
    functions["Generation.PhoneNumber_US"] = GenerationUtils.generatePhoneNumber_US;
    functions["Generation.PhoneNumber_UK"] = GenerationUtils.generatePhoneNumber_UK;
    functions["Generation.IPV4"] = GenerationUtils.generateIPV4;
    functions["Generation.IPV6"] = GenerationUtils.generateIPV6;
    functions["Generation.MacAddress"] = GenerationUtils.generateMacAddress;
    functions["Generation.MD5"] = GenerationUtils.generateMD5;
    functions["Generation.SHA1"] = GenerationUtils.generateSHA1;
    functions["Generation.SHA256"] = GenerationUtils.generateSHA256;
    functions["Generation.UUIDV1"] = GenerationUtils.generateUUIDV1;
    functions["Generation.UUIDV4"] = GenerationUtils.generateUUIDV4;
}