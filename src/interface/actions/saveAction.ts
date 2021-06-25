export interface ISaveAction {
    type: "SAVE" | "save";
    key: string;
    expressions: ISaveExpression[];
}

export interface ISaveExpression {
    key: string;
    value: string;
}