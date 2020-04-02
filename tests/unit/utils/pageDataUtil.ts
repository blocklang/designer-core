import { convertDataIdToJsonPath, getValue } from "../../../src/utils/pageDataUtil";
import { PageDataItem } from "../../../src/interfaces";

const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

describe("utils/pageDataUtil", () => {
	it("convertDataIdToJsonPath: dataId is empty", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "String",
				value: "bar",
				open: true,
			},
		];

		assert.equal(convertDataIdToJsonPath(pageData, ""), "");
	});

	it("convertDataIdToJsonPath: pageData is empty", () => {
		const pageData: PageDataItem[] = [];
		assert.equal(convertDataIdToJsonPath(pageData, "1"), "");
	});

	it("convertDataIdToJsonPath: pageData is not empty, but dataId can not match any data", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "String",
				value: "a",
				open: true,
			},
		];
		assert.equal(convertDataIdToJsonPath(pageData, "3"), "");
	});

	it("convertDataIdToJsonPath: result is $.foo", () => {
		// 约定 data 的根节点的 name 为 $
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "String",
				value: "a",
				open: true,
			},
		];
		assert.equal(convertDataIdToJsonPath(pageData, "2"), "$.foo");
	});

	it("convertDataIdToJsonPath: result is $.foo.bar", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Object",
				open: true,
			},
			{
				id: "3",
				parentId: "2",
				name: "bar",
				type: "String",
				value: "a",
				open: true,
			},
		];
		assert.equal(convertDataIdToJsonPath(pageData, "3"), "$.foo.bar");
	});

	it("convertDataIdToJsonPath: result is $.foo[0]", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Array",
				open: true,
			},
			{
				id: "3",
				parentId: "2",
				name: "0",
				type: "String",
				value: "a",
				open: true,
			},
		];
		assert.equal(convertDataIdToJsonPath(pageData, "3"), "$.foo[0]");
	});

	it("convertDataIdToJsonPath: result is $.foo[1]", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Array",
				open: true,
			},
			{
				id: "3",
				parentId: "2",
				name: "0",
				type: "String",
				value: "a",
				open: true,
			},
			{
				id: "4",
				parentId: "2",
				name: "1",
				type: "String",
				value: "b",
				open: true,
			},
		];
		assert.equal(convertDataIdToJsonPath(pageData, "4"), "$.foo[1]");
	});

	it("convertDataIdToJsonPath: result is $.foo.bar[0] or $.foo.bar[1]", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Object",
				open: true,
			},
			{
				id: "3",
				parentId: "2",
				name: "bar",
				type: "Array",
				value: "a",
				open: true,
			},
			{
				id: "4",
				parentId: "3",
				name: "0",
				type: "String",
				value: "b",
				open: true,
			},
			{
				id: "5",
				parentId: "3",
				name: "0",
				type: "String",
				value: "b",
				open: true,
			},
		];
		assert.equal(convertDataIdToJsonPath(pageData, "4"), "$.foo.bar[0]");
		assert.equal(convertDataIdToJsonPath(pageData, "5"), "$.foo.bar[1]");
	});

	it("getValue: undefined", () => {
		const pageData: PageDataItem[] = [];
		assert.isUndefined(getValue(pageData, ""));
		assert.isUndefined(getValue(pageData, "1"));
	});

	it("getValue: string value", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "String",
				value: "a",
				open: true,
			},
		];
		assert.equal(getValue(pageData, "2"), "a");
	});

	it("getValue: number value", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Number",
				value: "1",
				open: true,
			},
		];
		assert.strictEqual(getValue(pageData, "2"), 1);
	});

	it("getValue: boolean value", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Boolean",
				value: "true",
				open: true,
			},
		];
		assert.isTrue(getValue(pageData, "2"));
	});

	it("getValue: object value {foo: 'bar'}", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "String",
				open: true,
				value: "bar",
			},
		];
		assert.deepEqual(getValue(pageData, "1"), { foo: "bar" });
	});

	it("getValue: object value {foo: 'a', bar: 'b'}", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "String",
				open: true,
				value: "a",
			},
			{
				id: "3",
				parentId: "1",
				name: "bar",
				type: "String",
				open: true,
				value: "b",
			},
		];
		assert.deepEqual(getValue(pageData, "1"), { foo: "a", bar: "b" });
	});

	it("getValue: object value {foo: {bar: 'a'}}", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Object",
				open: true,
			},
			{
				id: "3",
				parentId: "2",
				name: "bar",
				type: "String",
				open: true,
				value: "a",
			},
		];
		assert.deepEqual(getValue(pageData, "1"), { foo: { bar: "a" } });
	});

	it("getValue: array value ['a', 'b']", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "foo",
				type: "Array",
				open: true,
				value: "a",
			},
			{
				id: "3",
				parentId: "2",
				name: "0",
				type: "String",
				open: true,
				value: "a",
			},
			{
				id: "4",
				parentId: "2",
				name: "1",
				type: "String",
				open: true,
				value: "b",
			},
		];
		assert.deepEqual(getValue(pageData, "2"), ["a", "b"]);
	});

	it("getValue: array value [{foo:'bar'}]", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "array",
				type: "Array",
				open: true,
				value: "a",
			},
			{
				id: "3",
				parentId: "2",
				name: "0",
				type: "Object",
				open: true,
			},
			{
				id: "4",
				parentId: "3",
				name: "foo",
				type: "String",
				open: true,
				value: "bar",
			},
		];
		assert.deepEqual(getValue(pageData, "2"), [{ foo: "bar" }]);
	});

	it("getValue: array value [{a:'1'}, {b:[{c:'2'}]}]", () => {
		const pageData: PageDataItem[] = [
			{
				id: "1",
				parentId: "-1",
				name: "$",
				type: "Object",
				open: true,
			},
			{
				id: "2",
				parentId: "1",
				name: "array",
				type: "Array",
				open: true,
			},
			{
				id: "3",
				parentId: "2",
				name: "0",
				type: "Object",
				open: true,
			},
			{
				id: "4",
				parentId: "3",
				name: "a",
				type: "String",
				open: true,
				value: "1",
			},
			{
				id: "5",
				parentId: "2",
				name: "1",
				type: "Object",
				open: true,
			},
			{
				id: "6",
				parentId: "5",
				name: "b",
				type: "Array",
				open: true,
			},
			{
				id: "7",
				parentId: "6",
				name: "0",
				type: "Object",
				open: true,
			},
			{
				id: "8",
				parentId: "7",
				name: "c",
				type: "String",
				value: "2",
				open: true,
			},
		];
		assert.deepEqual(getValue(pageData, "2"), [{ a: "1" }, { b: [{ c: "2" }] }]);
	});
});
