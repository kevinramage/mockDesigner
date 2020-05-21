import { IMediaType } from "./mediaType";

export interface IResponse {
    description : string;
    headers : any;
    content : { [ key: string] : IMediaType};
    links : any;
}