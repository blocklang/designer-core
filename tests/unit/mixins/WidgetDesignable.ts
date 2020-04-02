const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness";
import { w, v } from "@dojo/framework/core/vdom";
import { WidgetDesignableMixin } from "../../../src/mixins/WidgetDesignable";
import WidgetBase from "@dojo/framework/core/WidgetBase";
import { AttachedWidget, EditableProperties } from "../../../src/interfaces";
import { stub } from "sinon";
import Overlay from "../../../src/widgets/overlay";

class Foo extends WidgetDesignableMixin(WidgetBase) {
	protected render() {
		return v("div", { key: "key1" });
	}
}

/**
 * 需要在此部件上添加遮盖层
 */
class Bar extends WidgetDesignableMixin(WidgetBase) {
	protected render() {
		return v("input", { key: "input1" });
	}

	protected needOverlay() {
		return true;
	}
}

class InputWidget extends WidgetDesignableMixin(WidgetBase) {
	protected render() {
		return v("input", { key: "input1" });
	}

	protected needOverlay() {
		return false;
	}

	protected getCanEditingPropertyName() {
		return "value";
	}
}

class SpanWidget extends WidgetDesignableMixin(WidgetBase) {
	protected render() {
		return v("span", { key: "span1" });
	}

	protected needOverlay() {
		return false;
	}

	protected getCanEditingPropertyName() {
		return "value";
	}
}

describe("Widget Designable mixin", () => {
	// 梳理测试 widget designable mixin 的测试点
	// 确认为部件扩展了以下功能：
	// 1. 为部件新增或覆盖 onMouseup 事件
	// 2. 支持为部件传入 onFocus 事件
	// 3. 测试获取的部件 dimensions 信息
	// 4. 支持直接在部件中编辑指定的属性
	// 查看渲染效果
	// 1. 在某些部件下添加了 overlay
	// 2. 在空容器部件下添加了无子部件的可视化效果

	// 确认本 mixin 默认为部件设置了 onMouseUp 事件
	// 当触发 onMouseUp 后，会调用 onFocus 事件
	it("auto focus", () => {
		const onFocusingStub = stub();
		const onFocusedStub = stub();

		const widget: AttachedWidget = {
			id: "1",
			parentId: "-1",
			apiRepoId: 1,
			widgetId: 1,
			widgetCode: "0001",
			widgetName: "Widget1",
			canHasChildren: true,
			properties: [],
		};
		const extendProperties: EditableProperties = {
			onFocusing: onFocusingStub,
			onFocused: onFocusedStub,
			onHighlight: stub(),
			onUnhighlight: stub(),
			autoFocus: () => true,
		};

		harness(() =>
			w(Foo, {
				widget,
				extendProperties,
			})
		);

		console.log("call count", onFocusedStub.callCount);

		assert.isTrue(onFocusingStub.notCalled);
		// 最好只调用一次，但现在实际上调用了两次。
		assert.isTrue(onFocusedStub.calledTwice);
	});

	it("not auto focus", () => {
		const onFocusingStub = stub();
		const onFocusedStub = stub();

		const widget: AttachedWidget = {
			id: "1",
			parentId: "-1",
			apiRepoId: 1,
			widgetId: 1,
			widgetCode: "0001",
			widgetName: "Widget1",
			canHasChildren: true,
			properties: [],
		};
		const extendProperties: EditableProperties = {
			onFocusing: onFocusingStub,
			onFocused: onFocusedStub,
			onHighlight: stub(),
			onUnhighlight: stub(),
			autoFocus: () => false,
		};

		harness(() =>
			w(Foo, {
				widget,
				extendProperties,
			})
		);

		assert.isTrue(onFocusingStub.notCalled);
		assert.isTrue(onFocusedStub.notCalled);
	});

	it("use deferred properties for widgets which not need overlay", () => {
		const onFocusingStub = stub();
		const onFocusedStub = stub();

		let activeWidgetId = "3";
		// not root node
		const widget: AttachedWidget = {
			id: "2",
			parentId: "1", // 约定值为 -1 时，表示根部件
			apiRepoId: 1,
			widgetId: 1,
			widgetCode: "0001",
			widgetName: "Widget1",
			canHasChildren: true,
			properties: [],
		};

		function _autoFocus(widgetId: string) {
			console.log(activeWidgetId, widgetId);
			return activeWidgetId === widgetId;
		}

		const extendProperties: EditableProperties = {
			onFocusing: onFocusingStub,
			onFocused: onFocusedStub,
			onHighlight: stub(),
			onUnhighlight: stub(),
			autoFocus: _autoFocus,
		};

		let h = harness(() =>
			w(Foo, {
				widget,
				extendProperties,
			})
		);

		// 没有聚焦
		h.expect(() => [
			v("div", {
				key: "key1",
				onmouseup: () => {},
				onmouseover: () => {},
				onmouseout: () => {},
			}),
		]);

		assert.isTrue(onFocusingStub.notCalled);
		assert.isTrue(onFocusedStub.notCalled);

		// 聚焦
		activeWidgetId = "2";
		h = harness(() =>
			w(Foo, {
				widget,
				extendProperties,
			})
		);

		assert.isTrue(onFocusingStub.notCalled);
		assert.isTrue(onFocusedStub.calledTwice);

		h.expect(() => [
			v("div", {
				key: "key1",
				onmouseup: () => {},
				onmouseover: () => {},
				onmouseout: () => {},
			}),
			v("span", { key: "__alwaysRenderFocusBox__" }),
		]);
	});

	it("use deferred properties for widgets which need overlay", () => {
		const onFocusingStub = stub();
		const onFocusedStub = stub();

		let activeWidgetId = "3";
		// not root node
		const widget: AttachedWidget = {
			id: "2",
			parentId: "1", // 约定值为 -1 时，表示根部件
			apiRepoId: 1,
			widgetId: 1,
			widgetCode: "0001",
			widgetName: "Widget1",
			canHasChildren: true,
			properties: [],
		};

		function _autoFocus(widgetId: string) {
			console.log(activeWidgetId, widgetId);
			return activeWidgetId === widgetId;
		}

		const extendProperties: EditableProperties = {
			onFocusing: onFocusingStub,
			onFocused: onFocusedStub,
			onHighlight: stub(),
			onUnhighlight: stub(),
			autoFocus: _autoFocus,
		};

		let h = harness(() =>
			w(Bar, {
				widget,
				extendProperties,
			})
		);

		// 没有聚焦
		h.expect(() => [
			v("input", {
				key: "input1",
			}),
			w(Overlay, {
				top: 0,
				left: 0,
				height: 0,
				width: 0,
				onmouseup: () => {},
				onmouseover: () => {},
				onmouseout: () => {},
			}),
		]);

		assert.isTrue(onFocusingStub.notCalled);
		assert.isTrue(onFocusedStub.notCalled);

		// 聚焦
		activeWidgetId = "2";
		h = harness(() =>
			w(Bar, {
				widget,
				extendProperties,
			})
		);

		assert.isTrue(onFocusingStub.notCalled);
		assert.isTrue(onFocusedStub.calledTwice);

		h.expect(() => [
			v("input", {
				key: "input1",
			}),
			w(Overlay, {
				top: 0,
				left: 0,
				height: 0,
				width: 0,
				onmouseup: () => {},
				onmouseover: () => {},
				onmouseout: () => {},
			}),
			v("span", { key: "__alwaysRenderFocusBox__" }),
		]);
	});

	it("When there is one root node, bind onMouseUp event to the single root node", () => {
		const onFocusingStub = stub();
		const onFocusedStub = stub();

		const widget: AttachedWidget = {
			id: "1",
			parentId: "-1",
			apiRepoId: 1,
			widgetId: 1,
			widgetCode: "0001",
			widgetName: "Widget1",
			canHasChildren: true,
			properties: [],
		};

		const extendProperties: EditableProperties = {
			onFocusing: onFocusingStub,
			onFocused: onFocusedStub,
			onHighlight: stub(),
			onUnhighlight: stub(),
		};

		const h = harness(() =>
			w(Foo, {
				widget,
				extendProperties,
			})
		);

		h.trigger("@key1", "onmouseup", { stopImmediatePropagation: () => {} });

		assert.isTrue(onFocusingStub.calledOnce);
		assert.isTrue(onFocusedStub.notCalled);
	});

	it("When there is one root node, bind onMouseOver to the single root node", () => {
		const onHighlightStub = stub();
		const onUnhighlightStub = stub();

		const widget: AttachedWidget = {
			id: "1",
			parentId: "-1",
			apiRepoId: 1,
			widgetId: 1,
			widgetCode: "0001",
			widgetName: "Widget1",
			canHasChildren: true,
			properties: [],
		};

		const extendProperties: EditableProperties = {
			onFocusing: stub(),
			onFocused: stub(),
			onHighlight: onHighlightStub,
			onUnhighlight: onUnhighlightStub,
		};

		const h = harness(() =>
			w(Foo, {
				widget,
				extendProperties,
			})
		);

		h.trigger("@key1", "onmouseover", { stopImmediatePropagation: () => {} });

		assert.isTrue(onHighlightStub.calledOnce);
		assert.isTrue(onUnhighlightStub.notCalled);
	});

	it("When there is one root node, bind onMouseOut to the single root node, on mouse out page node, will remove highlight", () => {
		const onHighlightStub = stub();
		const onUnhighlightStub = stub();

		// Page is root node
		const widget: AttachedWidget = {
			id: "1",
			parentId: "-1",
			apiRepoId: 1,
			widgetId: 1,
			widgetCode: "0001",
			widgetName: "Widget1",
			canHasChildren: true,
			properties: [],
		};

		const extendProperties: EditableProperties = {
			onFocusing: stub(),
			onFocused: stub(),
			onHighlight: onHighlightStub,
			onUnhighlight: onUnhighlightStub,
		};

		const h = harness(() =>
			w(Foo, {
				widget,
				extendProperties,
			})
		);

		h.trigger("@key1", "onmouseout", { stopImmediatePropagation: () => {} });

		assert.isTrue(onHighlightStub.notCalled);
		assert.isTrue(onUnhighlightStub.calledOnce);
	});

	it("When there is one widget, onPropertyChanged event is undefined", () => {
		// not root node
		const widget: AttachedWidget = {
			id: "2",
			parentId: "1", // 约定值为 -1 时，表示根部件
			apiRepoId: 1,
			widgetId: 1,
			widgetCode: "0001",
			widgetName: "Widget1",
			canHasChildren: true,
			properties: [
				{
					id: "1",
					value: "",
					isExpr: false,
					code: "0011",
					name: "value",
					valueType: "string",
				},
			],
		};

		const extendProperties: EditableProperties = {
			onFocusing: stub(),
			onFocused: stub(),
			onHighlight: stub(),
			onUnhighlight: stub(),
		};

		const h = harness(() =>
			w(InputWidget, {
				widget,
				extendProperties,
			})
		);

		// 如果没有传入 onPropertyChanged 事件，则不绑定 oninput 事件
		h.expectPartial("@input1", () =>
			v("input", {
				key: "input1",
				onmouseup: () => {},
				onmouseover: () => {},
				onmouseout: () => {},
			})
		);
	});

	it("bind onPropertyChanged to widget, the target is a input node", () => {
		const onPropertyChangedStub = stub();

		// not root node
		const widget: AttachedWidget = {
			id: "2",
			parentId: "1", // 约定值为 -1 时，表示根部件
			apiRepoId: 1,
			widgetId: 1,
			widgetCode: "0001",
			widgetName: "Widget1",
			canHasChildren: true,
			properties: [
				{
					id: "1",
					value: "",
					isExpr: false,
					code: "0011",
					name: "value",
					valueType: "string",
				},
			],
		};

		const extendProperties: EditableProperties = {
			onFocusing: stub(),
			onFocused: stub(),
			onHighlight: stub(),
			onUnhighlight: stub(),
			onPropertyChanged: onPropertyChangedStub,
		};

		const h = harness(() =>
			w(InputWidget, {
				widget,
				extendProperties,
			})
		);

		h.expectPartial("@input1", () =>
			v("input", {
				key: "input1",
				onmouseup: () => {},
				onmouseover: () => {},
				onmouseout: () => {},
				oninput: () => {},
			})
		);

		h.trigger("@input1", "oninput", { target: { tagName: "INPUT", value: "a" } });

		assert.isTrue(
			onPropertyChangedStub.withArgs({ index: 0, newValue: "a", isChanging: false, isExpr: false }).calledOnce
		);
	});

	it("bind onPropertyChanged to widget, the target is a span node", () => {
		const onPropertyChangedStub = stub();

		// not root node
		const widget: AttachedWidget = {
			id: "2",
			parentId: "1", // 约定值为 -1 时，表示根部件
			apiRepoId: 1,
			widgetId: 1,
			widgetCode: "0001",
			widgetName: "Widget1",
			canHasChildren: true,
			properties: [
				{
					id: "1",
					value: "",
					isExpr: false,
					code: "0011",
					name: "value",
					valueType: "string",
				},
			],
		};

		const extendProperties: EditableProperties = {
			onFocusing: stub(),
			onFocused: stub(),
			onHighlight: stub(),
			onUnhighlight: stub(),
			onPropertyChanged: onPropertyChangedStub,
		};

		const h = harness(() =>
			w(SpanWidget, {
				widget,
				extendProperties,
			})
		);

		h.expectPartial("@span1", () =>
			v("span", {
				key: "span1",
				onmouseup: () => {},
				onmouseover: () => {},
				onmouseout: () => {},
				oninput: () => {},
			})
		);

		h.trigger("@span1", "oninput", { target: { tagName: "SPAN", textContent: "a" } });

		assert.isTrue(
			onPropertyChangedStub.withArgs({ index: 0, newValue: "a", isChanging: false, isExpr: false }).calledOnce
		);
	});
});
