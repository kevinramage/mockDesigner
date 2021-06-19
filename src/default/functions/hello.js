function hello() {
    return "Hello"
}

function helloWorld(args) {
    const name = args.length > 1 ? args[1] : undefined;
    return "Hello world " + name;
}

function register(functions) {
    functions["Hello"] = hello;
    functions["HelloWorld"] = helloWorld;
}