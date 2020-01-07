import { convertDataIdToJsonPath } from "../../src/pageData";
import { PageData } from "../../src/interfaces";

const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

describe("pageData", () => {
	it("convertDataIdToJsonPath: dataId is empty", () => {
		const pageData: PageData[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "String",
				value: "bar",
				open: true
			}
		];

		assert.equal(convertDataIdToJsonPath(pageData, ""), "");
	});

	it("convertDataIdToJsonPath: pageData is empty", () => {
		const pageData: PageData[] = [];
		assert.equal(convertDataIdToJsonPath(pageData, "1"), "");
	});

	it("convertDataIdToJsonPath: result is $.foo", () => {
		// 约定 data 的根节点的 name 为 $
		const pageData: PageData[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "String",
				value: "a",
				open: true
			}
		];
		assert.equal(convertDataIdToJsonPath(pageData, "2"), "$.foo");
	});

	it("convertDataIdToJsonPath: result is $.foo.bar", () => {
		const pageData: PageData[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Object",
				open: true
			},
			{
				id: "3",
				parentId: "2",
				name: "bar",
				type: "String",
				value: "a",
				open: true
			}
		];
		assert.equal(convertDataIdToJsonPath(pageData, "3"), "$.foo.bar");
	});

	it("convertDataIdToJsonPath: result is $.foo[0]", () => {
		const pageData: PageData[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Array",
				open: true
			},
			{
				id: "3",
				parentId: "2",
				name: "0",
				type: "String",
				value: "a",
				open: true
			}
		];
		assert.equal(convertDataIdToJsonPath(pageData, "3"), "$.foo[0]");
	});

	it("convertDataIdToJsonPath: result is $.foo[1]", () => {
		const pageData: PageData[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Array",
				open: true
			},
			{
				id: "3",
				parentId: "2",
				name: "0",
				type: "String",
				value: "a",
				open: true
			},
			{
				id: "4",
				parentId: "2",
				name: "1",
				type: "String",
				value: "b",
				open: true
			}
		];
		assert.equal(convertDataIdToJsonPath(pageData, "4"), "$.foo[1]");
	});

	it("convertDataIdToJsonPath: result is $.foo.bar[0] or $.foo.bar[1]", () => {
		const pageData: PageData[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Object",
				open: true
			},
			{
				id: "3",
				parentId: "2",
				name: "bar",
				type: "Array",
				value: "a",
				open: true
			},
			{
				id: "4",
				parentId: "3",
				name: "0",
				type: "String",
				value: "b",
				open: true
			},
			{
				id: "5",
				parentId: "3",
				name: "0",
				type: "String",
				value: "b",
				open: true
			}
		];
		assert.equal(convertDataIdToJsonPath(pageData, "4"), "$.foo.bar[0]");
		assert.equal(convertDataIdToJsonPath(pageData, "5"), "$.foo.bar[1]");
	});
});
