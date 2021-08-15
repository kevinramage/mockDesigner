import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import { format } from "util";
import { Project } from "./project";
import * as winston from "winston";
import { ProjectManager } from "../core/projectManager";

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
                        if (project) {
                            ProjectManager.instance.addProject(project);
                            projects.push(project);
                        } else {
                            winston.error(format("Projects.buildProjects - project '%s' ignored due previous errors", files[key]))
                        }
                    }
                }
                resolve(projects);
            } catch (err) {
                reject(err);
            }
        });
    }
}