import { BusinessObject } from "../utils/businessObject";
import { expect } from "chai";

describe("Determine business object", () => {

    it("Business object without id", () => {
        const path = "/api/v1/item/";
        const expected = "item";
        const businessObject = BusinessObject.determine(path);
        expect(businessObject).to.equals(expected);
    });
    it("Business object with id", () => {
        const path = "/api/v1/item/{id}";
        const expected = "item";
        const businessObject = BusinessObject.determine(path);
        expect(businessObject).to.equals(expected);
    });
    it("Simple service", () => {
        const path = "/api/v1/sendEvent";
        const expected = "sendEvent";
        const businessObject = BusinessObject.determine(path);
        expect(businessObject).to.equals(expected);
    });
    it("Business object with sub item", () => {
        const path = "/api/v1/item/{id}/subItem";
        const expected = "item.subItem";
        const businessObject = BusinessObject.determine(path);
        expect(businessObject).to.equals(expected);
    });
    it("Business object with sub item and id", () => {
        const path = "/api/v1/item/{id}/subItem/{id2}";
        const expected = "item.subItem";
        const businessObject = BusinessObject.determine(path);
        expect(businessObject).to.equals(expected);
    });
    it("Business object with mutiple sub item", () => {
        const path = "/api/v1/item/{id}/subItem/{id2}/subSubItem";
        const expected = "item.subItem.subSubItem";
        const businessObject = BusinessObject.determine(path);
        expect(businessObject).to.equals(expected);
    });
    it("Business object with multiple sub item and id", () => {
        const path = "/api/v1/item/{id}/subItem/{id2}/subSubItem/{id2}/";
        const expected = "item.subItem.subSubItem";
        const businessObject = BusinessObject.determine(path);
        expect(businessObject).to.equals(expected);
    });
})