export interface IMockMessageAction {
    type: "message"
    status: number
    headers: {}
    bodyFile: string
}