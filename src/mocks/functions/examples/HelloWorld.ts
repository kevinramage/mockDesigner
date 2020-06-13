export class HelloWorld {

    public static hello(context: any, name: string) {
        return "Hello " + name;
    }

    public static get functions() {
        return [
            { name: "HelloWorld", func: HelloWorld.hello }
        ]
    }
}