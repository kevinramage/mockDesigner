import { Project } from "../business/project/project";
import { IProject } from "../interface/project";
import { ServiceFactory } from "./service";

export class ProjectFactory {

    public static build(project: Project, projectData: IProject, workspace: string) {

        if (projectData.name) { project.name = projectData.name; }
        if ( projectData.services ) {
            projectData.services.forEach(serviceData => {
                const service = ServiceFactory.build(serviceData, workspace);
                project.addService(service);
            });
        }

        return project;
    }
}