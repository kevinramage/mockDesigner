import { readdir } from "fs";
import { join } from "path";
import { Project } from "./project";


export class Projects {
    public static readProjects(folderPath: string) {
        return new Promise<Project[]>((resolve, reject) => {
            readdir(folderPath, async (err, files) => {
                if (!err) {
                    const projects : Project[] = [];
                    for (var index in files) {
                        const path = join(folderPath, files[index]);
                        const project = await Project.buildFromFile(path);
                        projects.push(project);
                    }
                    resolve(projects);
                } else {
                    reject(err);
                }
            });
        });
    }
}