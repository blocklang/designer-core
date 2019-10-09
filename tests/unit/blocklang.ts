const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import * as blocklang from "../../src/blocklang";
import { GitUrlSegment, ExtensionWidgetMap } from "../../src/interfaces";
import WidgetBase from "@dojo/framework/core/WidgetBase";

class Foo extends WidgetBase {}
const propertiesLayout = {};

describe("blocklang", () => {
	it("register widgets", () => {
		const gitUrlSegment: GitUrlSegment = { website: "a", owner: "b", repoName: "c" };
		const widgets: ExtensionWidgetMap = { "text-input": { widget: Foo, propertiesLayout } };
		blocklang.registerWidgets(gitUrlSegment, widgets);

		assert.isUndefined(blocklang.findWidgetType(gitUrlSegment, "not-exist"));
		assert.deepEqual(blocklang.findWidgetType(gitUrlSegment, "text-input"), Foo);
		assert.deepEqual(blocklang.findWidgetType("a/b/c", "text-input"), Foo);
	});
});
