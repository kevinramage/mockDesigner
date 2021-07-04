import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import { Project } from "./project";


export class Projects {

    public static buildProjects(folderPath: string) {
        return new Promise<Project[]>(async(resolve, reject) => {
            try {
                const projects : Project[] = [];
                const files = readdirSync(folderPath);
                for (var key in files) {
                    const path = join(folderPath, files[key]);
                    const isDirectory = lstatSync(path);
                    if (isDirectory) {
                        const project = await Project.buildFromFile(path, files[key]);
                        projects.push(project);
                    }
                }
                resolve(projects);
            } catch (err) {
                reject(err);
            }
        });
    }
}