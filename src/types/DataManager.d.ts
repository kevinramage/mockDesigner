export class DataManager {
    registerDataSource(dataSourceName: string, workspace?: string) : Promise<void>;
    dataSources: {[name: string] : object};
}