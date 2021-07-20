import { FileUtils } from "../utils/fileUtils";

export class ProjectFile {

    private _id: number;
    private _name : string;
    private _content : string;

    constructor(name: string, content: string) {
        this._id = -1;
        this._name = name;
        this._content = content;
    }

    public save() {
        return FileUtils.updateFile(this.name, this.content);
    }

    public toObject() {
        return {
            id: this.id,
            name: this.name
        }
    }

    public toObjectFull() {
        return {
            id: this.id,
            name: this.name,
            content: this.content
        }
    }

    public get id() {
        return this._id;
    }

    public set id(value) {
        this._id = value;
    }

    public get name() {
        return this._name;
    }

    public get content() {
        return this._content;
    }
}