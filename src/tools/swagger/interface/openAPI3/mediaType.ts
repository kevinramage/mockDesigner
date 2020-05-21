import { IExample } from "./example";

export interface IMediaType {
    schema : any;
    example : any;
    examples : { [id: string] : IExample };
    encoding : any;
}