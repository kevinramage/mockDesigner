const { readdirSync, lstatSync, existsSync, readFile, writeFile, statSync } =  require("fs");
const { exec } = require("child_process");
const { join } = require("path");
const { format } = require("util");
const { basename } = require("path");

// Compile default functions
const files = readdirSync("default/functions");
const tsFiles = files.filter(f => { return f.endsWith(".ts"); });
tsFiles.forEach(f => {
    compileLibrary("default/functions", "default/functions/" + f);
});

// Compile mock functions
const mockFiles = readdirSync("mock");
const directories = mockFiles.filter(f => { return lstatSync(join("mock",f)).isDirectory(); });
directories.forEach(d => {
    const functionDirectoryExists = existsSync(join("mock", d, "functions"));
    if (functionDirectoryExists) {
        const files = readdirSync(join("mock", d, "functions"));
        files.forEach(f => {
            if ( f.endsWith(".ts")) {
                const dirPath = join("mock", d, "functions");
                const filePath = join("mock", d, "functions", f);
                compileLibrary(dirPath, filePath);
            }
        });
    }
});

function compileLibrary(dir, file) {

    // Get informations about ts and js files
    let jsLastUpdated = new Date(null);
    const tsLastUpdated = statSync(file).mtime;
    const jsFile = file.substr(0, file.length - 3) + ".js";
    if (existsSync(jsFile)) {
        jsLastUpdated = statSync(jsFile).mtime;
    }

    // Check if compilation required
    if (tsLastUpdated.getTime() > jsLastUpdated.getTime()) {

        // Compile ts code
        console.info("Compiling " + file);
        exec(format("npx ts --target es6 --module commonjs --outDir %s %s", dir, file), (err, stdout, stderr) => {
            if (!err) {

                // Update JS import
                readFile(jsFile, (err, buffer) => {
                    if (!err) {
                        let data = buffer.toString();
                        data = data.replace("require(\"../../types/Context\");", "require(\"./context\");");
                        data = data.replace("require(\"../../types/RedisManager\");", "require(\"./redisManager\");");
                        data = data.replace("require(\"../../types/DataManager\");", "require(\"./dataManager\");");
                        data = data.replace("require(\"../../types/FunctionManager\");", "require(\"./functionManager\");");
                        writeFile(jsFile, data, (err)=> {});
                    }
                });
            } else {
                console.error("Internal error during compilation " + err);
            }
        });
    } else {
        console.info("Compiling " + file + " (skip)");
    }
}