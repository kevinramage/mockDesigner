import * as fs from "fs";
import * as path from "path";
import rimraf from "rimraf";
import * as winston from "winston";
import { PortManager } from "../util/portManager";
import { format } from "util";
import { CommandManager } from "../util/commandManager";
import { ValidationError } from "../util/validationError";
import { INode } from "./node";
import Axios from "axios";
import { resolve } from "path";

export class NodeManager {

    private static _instance : NodeManager = new NodeManager();

    private constructor() {

    }

    /**
     * Create a new node
     * - Name must not already exists
     * - Name must be only composed of alphabetic characters
     * - Port must be available
     * @param name node name
     * @param port node port
     */
    public createNewNode(name: string, port: number) {
        const instance = this;
        winston.debug("NodeManager.createNewNode");
        return new Promise<INode>(async (resolve, reject) => {
            const nodePath = path.join(process.cwd(), "workspace", name);
            const portPath = path.join(process.cwd(), "workspace", name, "port.txt");
            const codePath = path.join(process.cwd(), "workspace", name, "code");
            const dataPath = path.join(process.cwd(), "workspace", name, "data");
            const functionsPath = path.join(process.cwd(), "workspace", name, "functions");
            const responsesPath = path.join(process.cwd(), "workspace", name, "responses");
            // Init
            instance.initWorkspace();

            // Check
            instance.canCreateNewNode(name, port).then(() => {

                // Create directories
                instance.createDirectories([nodePath, codePath, dataPath, functionsPath, responsesPath]);

                // Save the port
                fs.appendFileSync(portPath, port);

                resolve({name: name, port: port});

            }).catch((err) => {
                reject(err);
            });
        });
    }

    private canCreateNewNode(name: string, port: number) {
        return new Promise<boolean>(async(resolve, reject) => {
            const nodePath = path.join(process.cwd(), "workspace", name);

            // Check the name
            var check = true;
            const regex = /^[a-zA-Z]+$/g;
            if ( !regex.exec(name) ) {
                reject(new ValidationError("Invalid node name"));
            }
            if ( check && fs.existsSync(nodePath) ) {
                check = false;
                reject(new ValidationError("This node name already existed"));
            }

            // Check the port
            if ( check && (isNaN(port) || port < 0 || port >= 65536) ) {
                check = false;
                reject(new ValidationError("This port is not valid"));
            }

            if ( check ) {
                const isFreePort = await PortManager.isFreePort(port);
                if ( !isFreePort ) {
                    check = false;
                    reject(new ValidationError("This port is not free"));
                }
            }

            resolve(check);
        });
    }

    private createDirectories(directoriesName: string[]) {
        directoriesName.forEach(directoryName => {
            fs.mkdirSync(directoryName);
        });
    }

    public deleteNode(name: string) {
        const instance = this;
        winston.debug("NodeManager.deleteNode");
        return new Promise<void>((resolve, reject) => {
            instance.initWorkspace();

            // Remove directory
            const nodePath = path.join(process.cwd(), "workspace", name);
            rimraf(nodePath, async (err) => {
                if ( !err ) {

                    // Remove docker instances
                    await instance.stopContainer(name);
                    await instance.stopImage(name);

                    resolve();
                } else {
                    reject(err);
                }
            });
        });
    }

    public updateCode(nodeName: string, code: string) {
        const instance = this;
        winston.debug("NodeManager.addService");
        return new Promise<void>((resolve, reject) => {
            instance.initWorkspace();

            // Lock node
            instance.lockNode(nodeName);

            // Update informations
            instance.updateMockDesignerCode(nodeName, code);
            const port = instance.readPort(nodeName);

            // Compile and run the code
            instance.compileCode(nodeName, port).then(() => {
                instance.runCode(nodeName).then(() => {
                    instance.unlockNode(nodeName);
                    resolve();
                }).catch((err) => {
                    instance.unlockNode(nodeName);
                    reject(err);
                });
            }).catch((err) => {
                instance.unlockNode(nodeName);
                reject(err);
            });
        });
    }

    public getAllNodes() {
        const instance = this;
        winston.debug("NodeManager.getAllNodes");
        return new Promise<INode[]>((resolve) => {
            instance.initWorkspace();
            const workspacePath = path.join(process.cwd(), "workspace");
            const nodesName = fs.readdirSync(workspacePath);
            const nodes : INode[] = nodesName.map((nodeName) => {
                var port = instance.readPort(nodeName);
                return { name: nodeName, port: port };
            });
            resolve(nodes);
        });
    }

    public getNode(nodeName: string) {
        const instance = this;
        winston.debug("NodeManager.getNode");
        return new Promise<INode>((resolve, reject) => {
            const port = instance.readPort(nodeName);
            const serviceName = instance.readFirstServiceName(nodeName);
            if ( port != -1 ) {
                instance.getNodeStatus(serviceName, port).then((status) => {
                resolve({ name: nodeName, port: port, status: status as string });
            }).catch(() => {
                resolve({ name: nodeName, port: port, status: "UNDEPLOYED" });
            });
            } else {
                reject(new ValidationError("Invalid node name: " + nodeName));
            } 
        });
    }

    private getNodeStatus(serviceName: string, port: number) {
        const instance = this;
        winston.debug("NodeManager.getNodeStatus");
        return new Promise<string>((resolve) => {
            PortManager.isFreePort(port).then((isFreePort) => {
                if ( !isFreePort ) {
                    instance.pingService(serviceName, port).then((isPingSucceed) =>{
                        resolve(isPingSucceed ? "DEPLOYED" : "IN PROGRESS")
                    }).catch(() => {
                        resolve("IN PROGRESS")
                    });
                } else {
                    resolve("UNDEPLOY");
                }
            });
        }).catch(() => {
            resolve("UNDEPLOY");
        });
    }

    private pingService(serviceName: string, port: number) {
        winston.debug("NodeManager.pingService: " + serviceName + " - " + port);
        return new Promise<boolean>(resolve => {
            const url = format("http://localhost:%d/api/v1/%s/_ping", port, serviceName);
            Axios.get(url).then((res) => {
                winston.debug("NodeManager.pingService - Status: ", res.status, res.data);
                resolve(res.status == 204)
            }).catch((err) => {
                winston.error("NodeManager.pingService - Internal error: ", err);
                resolve(false);
            });
        });
    }

    private readFirstServiceName(nodeName: string) {
        winston.debug("NodeManager.getFirstServiceName");
        const serviceNameRegex = /  - name:\s*([a-zA-Z]+)/g
        const code = this.readCode(nodeName).replace(/\r/g, "").replace(/\n/g, " ");
        const match = serviceNameRegex.exec(code);
        if ( match ) {
            return match[1];
        } else {
            return "";
        }
    }

    private readCode(nodeName: string) {
        winston.debug("NodeManager.readNode");
        const codePath = path.join(process.cwd(), "workspace", nodeName, "code", "mockDescription.yaml");
        if ( fs.existsSync(codePath)) {
            return fs.readFileSync(codePath).toString();
        } else {
            return "";
        }
    }

    private readPort(nodeName: string) {
        winston.debug("NodeManager.readPort");
        const portPath = path.join(process.cwd(), "workspace", nodeName, "port.txt");
        if ( fs.existsSync(portPath)) {
            const portContent = fs.readFileSync(portPath).toString();
            return Number.parseInt(portContent);
        } else {
            return -1;
        }
    }

    private updateMockDesignerCode(nodeName: string, code: string) {
        winston.debug("NodeManager.addServiceInMockDescription");
        const mockDescriptionPath = path.join(process.cwd(), "workspace", nodeName, "code", "mockDescription.yaml");
        fs.writeFileSync(mockDescriptionPath, code);
    }

    private compileCode(nodeName: string, port: number) {
        winston.debug("NodeManager.compileCode");
        return new Promise<void>(async (resolve, reject) => {

            // Install application
            const mockDesignerPath = path.join(process.cwd(), "../", "../");
            var cmdLine = "npm install";
            await CommandManager.execute(cmdLine, mockDesignerPath, true);

            // Run the code generation
            var cmdLine = format("npm run start -- --projectName %s --port %d --input ./tools/mockIntegrationAPI/workspace/%s/code/mockDescription.yaml --output ./tools/mockIntegrationAPI/workspace/%s/generated_%s", nodeName, port, nodeName, nodeName, nodeName);
            CommandManager.execute(cmdLine, mockDesignerPath).then(() => {
                resolve();
            }).catch((err) => {
                winston.debug("NodeManager.compileCode - Error");
                reject(err);
            });
        });
    }

    private runCode(nodeName: string) {
        winston.debug("NodeManager.runCode");
        return new Promise<void>(async (resolve, reject) => {
            var cmdLine = format("docker-compose -f workspace/%s/generated_%s/docker-compose.yml up -d --build", nodeName, nodeName);
            await CommandManager.execute(cmdLine, process.cwd(), true);
            resolve();
        });
    }

    private getContainerId(nodeName: string, type: string) {
        winston.debug("NodeManager.getContainerId");
        return new Promise<string>(async (resolve) => {
            var cmdLine = format("docker ps -f name=generated_%s_%s -aq", nodeName, type);
            const containerId = await CommandManager.execute(cmdLine, process.cwd(), true)
            resolve(containerId);
        });
    }

    private getNodeId(nodeName: string) {
        winston.debug("NodeManager.getNodeId");
        return new Promise<string>(async (resolve) => {
            var cmdLine = format("docker images generated_%s_was -aq", nodeName);
            const nodeId = await CommandManager.execute(cmdLine, process.cwd(), true)
            resolve(nodeId);
        });
    }

    private stopContainer(nodeName: string) {
        winston.debug("NodeManager.stopContainer");
        return new Promise<void>(async (resolve) => {
            var containerId = await NodeManager.instance.getContainerId(nodeName, "was");
            if ( containerId != "") {
                await CommandManager.execute(format("docker stop %s", containerId), process.cwd(), true);
                await CommandManager.execute(format("docker rm %s", containerId), process.cwd(), true);
            }
            containerId = await NodeManager.instance.getContainerId(nodeName, "redis_1");
            if ( containerId != "") {
                await CommandManager.execute(format("docker stop %s", containerId), process.cwd(), true);
                await CommandManager.execute(format("docker rm %s", containerId), process.cwd(), true);
            }
            resolve();
        });
    }

    private stopImage(nodeName: string) {
        winston.debug("NodeManager.stopImage");
        return new Promise<void>(async (resolve) => {
            var nodeId = await NodeManager.instance.getNodeId(nodeName);
            if ( nodeId != "") {
                await CommandManager.execute(format("docker rmi %s", nodeId), process.cwd(), true);
            }
            resolve();
        });
    }


    private lockNode(nodeName: string) {
        winston.debug("NodeManager.lockNode");
        const lockPath = path.join(process.cwd(), "workspace", nodeName, ".lock");
        if ( !fs.existsSync(lockPath)) {
            fs.appendFileSync(lockPath, "");
        } else {
            throw new ValidationError("A deploiement is already in progress")
        }
    }

    private unlockNode(nodeName: string) {
        winston.debug("NodeManager.unlockNode");
        const lockPath = path.join(process.cwd(), "workspace", nodeName, ".lock");
        if ( fs.existsSync(lockPath)) {
            fs.unlinkSync(lockPath);
        }
    }

    private initWorkspace() {
        winston.debug("NodeManager.initWorkspace");
        if ( !this.isWorkspaceInitialized() ) {
            this.createWorkspace();
        }
    }

    private isWorkspaceInitialized() {
        winston.debug("NodeManager.isWorkspaceInitialized");
        const workspacePath = path.join(process.cwd(), "workspace");
        return fs.existsSync(workspacePath);
    }

    private createWorkspace() {
        winston.debug("NodeManager.createWorkspace");
        const workspacePath = path.join(process.cwd(), "workspace");
        fs.mkdirSync(workspacePath);
    }   

    public static get instance() {
        return this._instance;
    }
}