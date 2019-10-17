const { describe, it, afterEach } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import * as blocklang from "../../src/blocklang";
import { GitUrlSegment, ExtensionWidgetMap, PropertyLayout } from "../../src/interfaces";
import WidgetBase from "@dojo/framework/core/WidgetBase";

class Foo extends WidgetBase {}

describe("blocklang", () => {
	afterEach(() => {
		blocklang.clearExtensionComponents();
		blocklang.clearWidgetInstanceMap();
	});

	it("register widgets - repeat register", () => {
		const gitUrlSegment: GitUrlSegment = { website: "a", owner: "b", repoName: "c" };
		const widgets: ExtensionWidgetMap = { TextInput: { widget: Foo, propertiesLayout: [] } };
		blocklang.registerWidgets(gitUrlSegment, widgets);
		assert.throw(() => {
			blocklang.registerWidgets(gitUrlSegment, widgets);
		});
	});

	it("register widgets - find widget type", () => {
		const gitUrlSegment: GitUrlSegment = { website: "a", owner: "b", repoName: "c" };
		const widgets: ExtensionWidgetMap = { TextInput: { widget: Foo, propertiesLayout: [] } };
		blocklang.registerWidgets(gitUrlSegment, widgets);

		assert.isUndefined(blocklang.findWidgetType(gitUrlSegment, "not-exist"));
		assert.deepEqual(blocklang.findWidgetType(gitUrlSegment, "TextInput"), Foo);
		assert.deepEqual(blocklang.findWidgetType("a/b/c", "TextInput"), Foo);
	});

	it("register widgets - find widget properties layout", () => {
		const propertiesLayout: any[] = [{ propertyName: "name", propertyLabel: "名称" }];

		const gitUrlSegment: GitUrlSegment = { website: "a", owner: "b", repoName: "c" };
		const widgets: ExtensionWidgetMap = { TextInput: { widget: Foo, propertiesLayout } };
		blocklang.registerWidgets(gitUrlSegment, widgets);

		// 如果没有找到，则返回空数组，而不是 undefined
		assert.isArray(blocklang.findWidgetPropertiesLayout(gitUrlSegment, "not-exist"));
		assert.equal(blocklang.findWidgetPropertiesLayout(gitUrlSegment, "not-exist").length, 0);
		assert.deepEqual(blocklang.findWidgetPropertiesLayout(gitUrlSegment, "TextInput"), propertiesLayout);
		assert.deepEqual(blocklang.findWidgetPropertiesLayout("a/b/c", "TextInput"), propertiesLayout);
	});

	it("property layout interface", () => {
		const layout1: PropertyLayout = {
			propertyLabel: "label",
			propertyWidget: "widget",
			propertyGroup: [
				{
					divider: "vertical"
				},
				{
					divider: "horizontal"
				},
				{
					propertyName: "name",
					target: ["marginLeft"]
				}
			],
			target: [{ widget: "{parent}", propertyName: "flexDirection" }, "alignSelf"],
			if: { widget: "{parent}", propertyName: "display", propertyValue: ["flex", "inlineFlex"] }
		};

		assert.isObject(layout1);
	});

	it("repeat cache", () => {
		const gitUrlSegment: GitUrlSegment = { website: "a", owner: "b", repoName: "c" };
		const libraryWeakMap = new WeakMap();
		blocklang.cacheWidgetInstanceMap(gitUrlSegment, libraryWeakMap);
		assert.throw(() => {
			blocklang.cacheWidgetInstanceMap(gitUrlSegment, libraryWeakMap);
		});
	});

	it("cache weakMap A, then watch weakMap B, then A pass to B", () => {
		const gitUrlSegment: GitUrlSegment = { website: "a", owner: "b", repoName: "c" };
		const libraryWeakMap = new WeakMap();
		blocklang.cacheWidgetInstanceMap(gitUrlSegment, libraryWeakMap);

		const appWeakMap = new WeakMap();
		blocklang.watchingWidgetInstanceMap(appWeakMap);

		const key = {};
		assert.isFalse(appWeakMap.has(key));
		libraryWeakMap.set(key, "value1");
		console.log(libraryWeakMap, appWeakMap);
		assert.isTrue(appWeakMap.has(key));
	});
});
