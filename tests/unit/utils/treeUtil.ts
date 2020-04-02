const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");
import {
	getAllChildCount,
	getPreviousIndex,
	getNextIndex,
	getParentIndex,
	getChildrenIndex,
	getNodePath,
} from "../../../src/utils/treeUtil";

describe("utils/treeUtil", () => {
	it("getAllChildCount", () => {
		assert.throw(() => getAllChildCount([{ id: "1", parentId: "-1" }], 1)); // 超出索引
		assert.throw(() => getAllChildCount([{ id: "1", parentId: "-1" }], -1)); // 超出索引
		assert.equal(getAllChildCount([{ id: "1", parentId: "-1" }], 0), 0);
		assert.equal(
			getAllChildCount(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
				],
				0
			),
			1
		);
		assert.equal(
			getAllChildCount(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "3", parentId: "2" },
				],
				0
			),
			2
		);
		assert.equal(
			getAllChildCount(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "3", parentId: "2" },
					{ id: "4", parentId: "2" },
					{ id: "5", parentId: "1" },
				],
				1
			),
			2
		);
	});

	it("getChildrenIndex", () => {
		assert.deepEqual(getChildrenIndex([{ id: "1", parentId: "-1" }], "1", 1), []);
		assert.deepEqual(
			getChildrenIndex(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
				],
				"1",
				1
			),
			[1]
		);
		assert.deepEqual(
			getChildrenIndex(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "3", parentId: "2" },
				],
				"1",
				1
			),
			[1]
		);
		assert.deepEqual(
			getChildrenIndex(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "3", parentId: "2" },
					{ id: "4", parentId: "2" },
					{ id: "5", parentId: "1" },
				],
				"2",
				2
			),
			[2, 3]
		);
	});

	it("getPreviousIndex - out of index", () => {
		assert.throw(() => getPreviousIndex([{ id: "1", parentId: "-1" }], 1));
		assert.throw(() => getPreviousIndex([{ id: "1", parentId: "-1" }], -1));
	});

	it("getPreviousIndex - no previous node", () => {
		assert.equal(getPreviousIndex([{ id: "1", parentId: "-1" }], 0), -1);
	});

	it("getPreviousIndex - root->node1_node2, node2 one previous node", () => {
		assert.equal(
			getPreviousIndex(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "3", parentId: "1" },
				],
				2
			),
			1
		);
	});

	it("getPreviousIndex - root->node1->node11, root->node2, node2 previous node is node1", () => {
		assert.equal(
			getPreviousIndex(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "21", parentId: "2" },
					{ id: "3", parentId: "1" },
				],
				3
			),
			1
		);
	});

	it("getNextIndex - out of index", () => {
		assert.throw(() => getNextIndex([{ id: "1", parentId: "-1" }], 1));
		assert.throw(() => getNextIndex([{ id: "1", parentId: "-1" }], -1));
	});

	it("getNextIndex - no next node", () => {
		assert.equal(getNextIndex([{ id: "1", parentId: "-1" }], 0), -1);
	});

	it("getNextIndex - root->node1_node2, node1's next node is node2", () => {
		assert.equal(
			getNextIndex(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "3", parentId: "1" },
				],
				1
			),
			2
		);
	});

	it("getNextIndex - root->node1->node11, root->node2, node1's next node is node2", () => {
		assert.equal(
			getNextIndex(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "21", parentId: "2" },
					{ id: "3", parentId: "1" },
				],
				1
			),
			3
		);
	});

	it("getParentIndex - out of index", () => {
		assert.throw(() => getParentIndex([{ id: "1", parentId: "-1" }], 1));
		assert.throw(() => getParentIndex([{ id: "1", parentId: "-1" }], -1));
	});

	it("getParentIndex - no parent", () => {
		assert.equal(getParentIndex([{ id: "1", parentId: "-1" }], 0), -1);
	});

	it("getParentIndex - has parent", () => {
		assert.equal(
			getParentIndex(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
				],
				1
			),
			0
		);
	});

	it("getNodePath - treeNodes is empty", () => {
		assert.deepEqual(getNodePath([], 0), []);
	});

	it("getNodePath - index is out of range", () => {
		assert.deepEqual(getNodePath([{ id: "1", parentId: "-1" }], 1), []);
		assert.deepEqual(getNodePath([{ id: "1", parentId: "-1" }], -2), []);
	});

	it("getNodePath - root", () => {
		assert.deepEqual(
			getNodePath(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
				],
				0
			),
			[{ node: { id: "1", parentId: "-1" }, index: -1 }]
		);
	});

	it("getNodePath - root/[0]item", () => {
		assert.deepEqual(
			getNodePath(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
				],
				1
			),
			[
				{ node: { id: "1", parentId: "-1" }, index: -1 },
				{ node: { id: "2", parentId: "1" }, index: 0 },
			]
		);
	});

	it("getNodePath - root/[0]item/[0]item", () => {
		assert.deepEqual(
			getNodePath(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "3", parentId: "2" },
				],
				2
			),
			[
				{ node: { id: "1", parentId: "-1" }, index: -1 },
				{ node: { id: "2", parentId: "1" }, index: 0 },
				{ node: { id: "3", parentId: "2" }, index: 0 },
			]
		);
	});

	it("getNodePath - root/[0]item/[1]item/[1]item", () => {
		assert.deepEqual(
			getNodePath(
				[
					{ id: "1", parentId: "-1" },
					{ id: "2", parentId: "1" },
					{ id: "3", parentId: "2" },
					{ id: "4", parentId: "2" },
					{ id: "5", parentId: "4" },
					{ id: "6", parentId: "4" },
				],
				5
			),
			[
				{ node: { id: "1", parentId: "-1" }, index: -1 },
				{ node: { id: "2", parentId: "1" }, index: 0 },
				{ node: { id: "4", parentId: "2" }, index: 1 },
				{ node: { id: "6", parentId: "4" }, index: 1 },
			]
		);
	});
});
