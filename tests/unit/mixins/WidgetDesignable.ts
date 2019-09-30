const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness";
import { w, v } from "@dojo/framework/core/vdom";
import { WidgetDesignableMixin } from "../../../src/mixins/WidgetDesignable";
import WidgetBase from "@dojo/framework/core/WidgetBase";
import { InstWidget } from "../../../src/interfaces";
import { stub } from "sinon";

class Foo extends WidgetDesignableMixin(WidgetBase) {
	protected render() {
		return v("div", { key: "key1" });
	}
}

describe("Widget Designable mixin", () => {
	// 梳理测试 widget designable mixin 的测试点
	// 确认为部件扩展了以下功能：
	// 1. 为部件新增或覆盖 onMouseup 事件
	// 2. 支持为部件传入 onFocus 事件
	// 3. 测试获取的部件 dimensions 信息
	// 查看渲染效果
	// 1. 在某些部件下添加了 overlay
	// 2. 在空容器部件下添加了无子部件的可视化效果

	// 确认本 mixin 默认为部件设置了 onMouseUp 事件
	// 当触发 onMouseUp 后，会调用 onFocus 事件
	it("When there is one root node, add default onMouseUp event to the single root node", () => {
		const onFocusStub = stub();

		const widget: InstWidget = {
			id: "1",
			parentId: "-1",
			widgetCode: "0001",
			widgetName: "Widget1",
			canHasChildren: true
		};
		const originalProperties = {};
		const extendProperties = {
			onFocus: onFocusStub,
			activeWidgetId: "1"
		};

		const h = harness(() =>
			w(Foo, {
				widget,
				originalProperties,
				extendProperties
			})
		);

		h.trigger("@key1", "onmouseup", { stopImmediatePropagation: () => {} });

		assert.isTrue(onFocusStub.calledOnce);
	});
});
