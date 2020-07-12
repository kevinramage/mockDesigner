export interface IAction {
    type: string;
}

export interface IMessageAction extends IAction {
    status: number;
    headers: { 
        "content-type": string
    }
    body: string;
    bodyFile: string;
}

export interface ISaveAction extends IAction {
    storage: string;
}

export interface IWaitAction extends IAction {
    time: number;
}

export interface IMicroServiceAction extends IAction {
    action: string;
}