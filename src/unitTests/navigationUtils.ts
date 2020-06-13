import * as winston from "winston";
import { expect } from "chai";
import { NavigationUtils } from "../templates/util/NavigationUtils";

describe("navigationUtils - JSON navigation", () => {

    it("Field present", () => {
        const content = { "field1": "value1" };
        const result = NavigationUtils.getFieldFromJSON(content, "field1");
        expect(result).to.equals("value1");
    });
    it('Field not present', () => {
        const content = { "field1": "value1" };
        const result = NavigationUtils.getFieldFromJSON(content, "field2");
        expect(result).to.equals(null);
    });
    it('Invalid content', () => {
        var result = NavigationUtils.getFieldFromJSON(null, "field2");
        expect(result).to.equals(null);
        result = NavigationUtils.getFieldFromJSON(undefined, "field2");
        expect(result).to.equals(null);
        result = NavigationUtils.getFieldFromJSON("test", "field2");
        expect(result).to.equals(null);
        result = NavigationUtils.getFieldFromJSON([], "field2");
        expect(result).to.equals(null);
        result = NavigationUtils.getFieldFromJSON(1, "field2");
        expect(result).to.equals(null);
    });
});

describe("NavigationUtils - Check mandatory field ", () => {

    before(() => {
        const logger = winston.createLogger({ silent: true });
        winston.add(logger);
    });

    it("Nominal", () => {
        const content = { "field1": "value1"};
        const result = NavigationUtils.checkMandatoryField(content, "field1", "JSON");
        expect(result).to.equals("");
    });

    it("Field not present", () => {
        const content = { "field1": "value1"};
        const result = NavigationUtils.checkMandatoryField(content, "field2", "JSON");
        expect(result).to.equals("field2");
    });

    it("Field not present with empty content", () => {
        const content = { };
        const result = NavigationUtils.checkMandatoryField(content, "field2", "JSON");
        expect(result).to.equals("field2");
    });

    it("Nominal with path", () => {
        const content = { "field1": { "subField1": "value1" } };
        const result = NavigationUtils.checkMandatoryField(content, "field1.subField1", "JSON");
        expect(result).to.equals("");
    });

    it("Field not present with path", () => {
        const content = { "field1": { "subField1": "value1" } };
        const result = NavigationUtils.checkMandatoryField(content, "field1.subField2", "JSON");
        expect(result).to.equals("field1.subField2");
    });

    it("Optionnal mandatory field", () => {
        const content = { "field1": { "subField1": "value1" } };
        const result = NavigationUtils.checkMandatoryField(content, "field2.subField1", "JSON");
        expect(result).to.equals("");
    });

    it("Nominal with array", () => {
        const content = { "field1": [ 
            { name: "name1" },
            { name: "name2" },
            { name: "name3" },
         ] };
        const result = NavigationUtils.checkMandatoryField(content, "field1.name", "JSON");
        expect(result).to.equals("");
    });

    it("Field not present with array", () => {
        const content = { "field1": [ 
            { name: "name1" },
            { },
            { name: "name3" },
         ] };
        const result = NavigationUtils.checkMandatoryField(content, "field1.name", "JSON");
        expect(result).to.equals("field1[1].name");
    });

    it("Fields not present with array", () => {
        const content = { "field1": [ 
            { id: "id1" },
            { name: "name2" },
            { id: "id3" },
         ] };
        const result = NavigationUtils.checkMandatoryField(content, "field1.name", "JSON");
        expect(result).to.equals("field1[0].name, field1[2].name");
    });

    it("Empty mandatory field", () => {
        const content = { "field1": "value1"};
        const result = NavigationUtils.checkMandatoryField(content, "", "JSON");
        expect(result).to.equals("");
    });

});