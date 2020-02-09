const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");
import ideMiddleware from "../../../src/middleware/ide";
import { stub } from "sinon";

const dimensionsStub = {
	get: stub().returns({ offset: { top: 1, left: 2 }, size: { height: 3, width: 4 } })
};

const icacheStub = stub();

describe("middleware/ide", () => {
	it("activeWidgetEvents", () => {
		const { callback } = ideMiddleware();
		const ide = callback({
			id: "test",
			middleware: {
				dimensions: dimensionsStub,
				icache: icacheStub
			},
			properties: () => ({}),
			children: () => []
		});
		assert.hasAllKeys(ide.activeWidgetEvents(), ["onmouseup", "onmouseover", "onmouseout"]);
	});

	it("activeWidgetEvents: onmouseup", () => {
		const onFocusingStub = stub();
		const { callback } = ideMiddleware();
		const ide = callback({
			id: "test",
			middleware: {
				dimensions: dimensionsStub,
				icache: icacheStub
			},
			properties: () => ({ widget: { id: "1" }, extendProperties: { onFocusing: onFocusingStub } }),
			children: () => []
		});
		ide.activeWidgetEvents().onmouseup({ stopImmediatePropagation: () => {} } as MouseEvent);
		assert.isTrue(onFocusingStub.calledOnce);
	});

	it("activeWidgetEvents: onmouseover that not config key", () => {
		const onHighlightStub = stub();
		const { callback } = ideMiddleware();
		const ide = callback({
			id: "test",
			middleware: {
				dimensions: dimensionsStub,
				icache: icacheStub
			},
			properties: () => ({ widget: { id: "1" }, extendProperties: { onHighlight: onHighlightStub } }),
			children: () => []
		});
		ide.activeWidgetEvents().onmouseover({ stopImmediatePropagation: () => {} } as MouseEvent);
		assert.isTrue(onHighlightStub.notCalled);
	});

	it("activeWidgetEvents: onmouseover that onHighlight was called", () => {
		const onHighlightStub = stub();
		const { callback } = ideMiddleware();
		const ide = callback({
			id: "test",
			middleware: {
				dimensions: dimensionsStub,
				icache: icacheStub
			},
			properties: () => ({ widget: { id: "1" }, extendProperties: { onHighlight: onHighlightStub } }),
			children: () => []
		});
		ide.config("key");
		ide.activeWidgetEvents().onmouseover({ stopImmediatePropagation: () => {} } as MouseEvent);
		assert.isTrue(onHighlightStub.calledOnce);
	});

	it("activeWidgetEvents: onmouseout that onUnhighlight was not called", () => {
		const onUnhighlightStub = stub();
		const { callback } = ideMiddleware();
		const ide = callback({
			id: "test",
			middleware: {
				dimensions: dimensionsStub,
				icache: icacheStub
			},
			properties: () => ({
				widget: { parentId: "1" /* not -1*/ },
				extendProperties: { onUnhighlight: onUnhighlightStub }
			}),
			children: () => []
		});
		ide.config("key");
		ide.activeWidgetEvents().onmouseout({ stopImmediatePropagation: () => {} } as MouseEvent);
		assert.isTrue(onUnhighlightStub.notCalled);
	});

	it("activeWidgetEvents: onmouseout that onUnhighlight was called", () => {
		const onUnhighlightStub = stub();
		const { callback } = ideMiddleware();
		const ide = callback({
			id: "test",
			middleware: {
				dimensions: dimensionsStub,
				icache: icacheStub
			},
			properties: () => ({ widget: { parentId: "-1" }, extendProperties: { onUnhighlight: onUnhighlightStub } }),
			children: () => []
		});
		ide.config("key");
		ide.activeWidgetEvents().onmouseout({ stopImmediatePropagation: () => {} } as MouseEvent);
		assert.isTrue(onUnhighlightStub.calledOnce);
	});

	// it("tryFocus: not focused", () => {
	// 	const onFocusedStub = stub();
	// 	const { callback } = ideMiddleware();
	// 	const ide = callback({
	// 		id: "test",
	// 		middleware: {
	// 			dimensions: dimensionsStub,
	// 			icache: icacheStub
	// 		},
	// 		properties: () => ({
	// 			widget: { id: "1" },
	// 			extendProperties: { onFocused: onFocusedStub, autoFocus: () => false }
	// 		}),
	// 		children: () => []
	// 	});
	// 	ide.tryFocus();
	// 	assert.isTrue(onFocusedStub.notCalled);
	// });

	// it("tryFocus: should focused, but not config key", () => {
	// 	const onFocusedStub = stub();
	// 	const { callback } = ideMiddleware();
	// 	const ide = callback({
	// 		id: "test",
	// 		middleware: {
	// 			dimensions: dimensionsStub,
	// 			icache: icacheStub
	// 		},
	// 		properties: () => ({
	// 			widget: { id: "1" },
	// 			extendProperties: { onFocused: onFocusedStub, autoFocus: () => true }
	// 		}),
	// 		children: () => []
	// 	});
	// 	ide.tryFocus();
	// 	assert.isTrue(onFocusedStub.notCalled);
	// });

	// it("tryFocus: focused", () => {
	// 	const onFocusedStub = stub();
	// 	const { callback } = ideMiddleware();
	// 	const ide = callback({
	// 		id: "test",
	// 		middleware: {
	// 			dimensions: dimensionsStub,
	// 			icache: icacheStub
	// 		},
	// 		properties: () => ({
	// 			widget: { id: "1" },
	// 			extendProperties: { onFocused: onFocusedStub, autoFocus: () => true }
	// 		}),
	// 		children: () => []
	// 	});
	// 	ide.config("key");
	// 	ide.tryFocus();
	// 	assert.isTrue(onFocusedStub.calledOnce);
	// });

	it("changePropertyValue: not config editing property name", () => {
		const onPropertyChangedStub = stub();
		const { callback } = ideMiddleware();
		const ide = callback({
			id: "test",
			middleware: {
				dimensions: dimensionsStub,
				icache: icacheStub
			},
			properties: () => ({ extendProperties: { onPropertyChanged: onPropertyChangedStub } }),
			children: () => []
		});
		ide.changePropertyValue("a");
		assert.isTrue(onPropertyChangedStub.notCalled);
	});

	it("changePropertyValue: editing property name not match", () => {
		const onPropertyChangedStub = stub();
		const { callback } = ideMiddleware();
		const ide = callback({
			id: "test",
			middleware: {
				dimensions: dimensionsStub,
				icache: icacheStub
			},
			properties: () => ({
				widget: { properties: [{ name: "prop1" }] },
				extendProperties: { onPropertyChanged: onPropertyChangedStub }
			}),
			children: () => []
		});

		ide.config("key", "prop2");

		ide.changePropertyValue("a");
		assert.isTrue(onPropertyChangedStub.notCalled);
	});

	it("changePropertyValue: onPropertyChanged was called", () => {
		const onPropertyChangedStub = stub();
		const { callback } = ideMiddleware();
		const ide = callback({
			id: "test",
			middleware: {
				dimensions: dimensionsStub,
				icache: icacheStub
			},
			properties: () => ({
				widget: { properties: [{ name: "prop1" }] },
				extendProperties: { onPropertyChanged: onPropertyChangedStub }
			}),
			children: () => []
		});

		ide.config("key", "prop1");

		ide.changePropertyValue("a");
		assert.isTrue(onPropertyChangedStub.calledOnce);
	});

	it("getFocusNodeOffset: not focused", () => {
		const onPropertyChangedStub = stub();
		const { callback } = ideMiddleware();
		const ide = callback({
			id: "test",
			middleware: {
				dimensions: dimensionsStub,
				icache: icacheStub
			},
			properties: () => ({
				widget: { properties: [{ name: "prop1" }] },
				extendProperties: { onPropertyChanged: onPropertyChangedStub }
			}),
			children: () => []
		});

		ide.config("key", "prop1");
		const offset = ide.getFocusNodeOffset();
		// 是否需要添加遮盖层与当前部件是否获取焦点无关，只与部件的本身需要有关。
		assert.deepEqual(offset, { top: 1, left: 2, height: 3, width: 4 });
	});

	// it("getFocusNodeOffset: focused", () => {
	// 	const onFocusedStub = stub();
	// 	const { callback } = ideMiddleware();
	// 	const ide = callback({
	// 		id: "test",
	// 		middleware: {
	// 			dimensions: dimensionsStub,
	// 			icache: icacheStub
	// 		},
	// 		properties: () => ({
	// 			widget: { properties: [{ name: "prop1" }] },
	// 			extendProperties: { onFocused: onFocusedStub, autoFocus: () => true }
	// 		}),
	// 		children: () => []
	// 	});

	// 	ide.config("key", "prop1");
	// 	ide.tryFocus();

	// 	const offset = ide.getFocusNodeOffset();
	// 	assert.deepEqual(offset, { top: 1, left: 2, height: 3, width: 4 });
	// });
});
