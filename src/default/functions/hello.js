function hello() {
    return "Hello"
}

function helloWorld(context, nameArg) {
    const name = nameArg ? nameArg : "unamed";
    return "Hello world " + name;
}

function register(functions) {
    functions["Hello"] = hello;
    functions["HelloWorld"] = helloWorld;
}