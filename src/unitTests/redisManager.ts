import { expect } from "chai";
import { RedisManager } from "../templates/manager/redisManager";

describe("RedisManager - UpdateDeltaObject", () => {

    it("add non existing simple field", () => {
        const objSource = { "name": "myObject" };
        const objDelta = { "newAtt" : "myValue" };
        const objUpdated = RedisManager.instance.updateDeltaObject(objSource, objDelta);
        expect(objUpdated["name"]).to.equals("myObject");
        expect(objUpdated["newAtt"]).to.equals("myValue");
    });

    it("add existing simple field", () => {
        const objSource = { "name": "myObject" };
        const objDelta = { "name" : "myValue" };
        const objUpdated = RedisManager.instance.updateDeltaObject(objSource, objDelta);
        expect(objUpdated["name"]).to.equals("myValue");
    });

    it("add non existing object field", () => {
        const objSource = { "name": "myObject" };
        const objDelta = { "newObj" : { "myAtt": "myValue" } };
        const objUpdated = RedisManager.instance.updateDeltaObject(objSource, objDelta);
        expect(objUpdated["name"]).to.equals("myObject");
        expect(objUpdated["newObj"]["myAtt"]).to.equals("myValue");
    });

    it("add existing object field", () => {
        const objSource = { "name": "myObject" };
        const objDelta = { "name" : { "myAtt": "myValue" } };
        const objUpdated = RedisManager.instance.updateDeltaObject(objSource, objDelta);
        expect(objUpdated["name"]["myAtt"]).to.equals( "myValue");
    });

    it("add non existing array field", () => {
        const objSource = { "name": "myObject" };
        const objDelta = { "name": "myObject", "myArray": [ 1 ] };
        const objUpdated = RedisManager.instance.updateDeltaObject(objSource, objDelta);
        expect(objUpdated["myArray"].length).to.equals(1);
    });

    it("add non existing field in array field", () => {
        const objSource = { "name": "myObject", "myArray": [ 1 ] };
        const objDelta = { "name": "myObject", "myArray": [ 1, 2 ] };
        const objUpdated = RedisManager.instance.updateDeltaObject(objSource, objDelta);
        expect(objUpdated["myArray"].length).to.equals(2);
        expect(objUpdated["myArray"][0]).to.equals(1);
        expect(objUpdated["myArray"][1]).to.equals(2);
    });

    it("add existing field in array field", () => {
        const objSource = { "name": "myObject", "myArray": [ 1, 2 ] };
        const objDelta = { "name": "myObject", "myArray": [ 1, 2 ] };
        const objUpdated = RedisManager.instance.updateDeltaObject(objSource, objDelta);
        expect(objUpdated["myArray"].length).to.equals(2);
        expect(objUpdated["myArray"][0]).to.equals(1);
        expect(objUpdated["myArray"][1]).to.equals(2);
    });
});