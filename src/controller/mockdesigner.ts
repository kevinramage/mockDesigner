import * as fs from "fs";
import * as yaml from "yaml";
import * as util from "util";
import * as winston from "winston";
import { IMock } from "../interface/mock";
import { Mock } from "../business/mock";
import { MockFactory } from "../factory/mockFactory";

export class MockDesigner {

    private _mockInterface : IMock | undefined;
    private _mock : Mock | undefined;

    public read(path: string) {
        winston.debug(util.format("MockDesigner.read: %s"), path);
        var body = fs.readFileSync(path).toString();
        this._mockInterface = yaml.parse(body) as IMock;
        this._mock = MockFactory.build(this._mockInterface);
    }

    public validate() : boolean {
        winston.debug("MockDesigner.validate");
        return true;
    }

    public get mock() {
        return this._mock;
    }
}