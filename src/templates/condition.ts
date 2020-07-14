export class Condition {
    private _leftOperand : string;
    private _rightOperand : string;
    private _operation : string;

    constructor(leftOperand ?: string, operation ?: string, rightOperand ?: string) {
        this._leftOperand = leftOperand || "";
        this._operation = operation || "";
        this._rightOperand = rightOperand || "";
    }

    public get leftOperand() {
        return this._leftOperand;
    }
    public set leftOperand(value: string) {
        this._leftOperand = value;
    }

    public get rightOperand() {
        return this._rightOperand;
    }

    public set rightOperand(value) {
        this._rightOperand = value;
    }

    public get operation() {
        return this._operation;
    }

    public set operation(value) {
        this._operation = value;
    }

}