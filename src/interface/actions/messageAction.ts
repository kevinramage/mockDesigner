export interface IMessageAction {
    type: "MESSAGE" | "message";
    status: number;
    headers: {[key: string]: string};
    body: string;
    bodyFile: string;
    template: boolean;
}