import createMockIdeMiddleware from "../../../../../src/testing/mocks/middleware/ide";
import ide from "../../../../../src/middleware/ide";
import { create, v, w } from "@dojo/framework/core/vdom";
import harness from "@dojo/framework/testing/harness/harness";

const { describe, it } = intern.getInterface("bdd");

describe("testing/mocks/middleware/ide", () => {
	it("cache", () => {
		const ideMock = createMockIdeMiddleware();

		const factory = create({ ide });
		const App = factory(({ middleware: { ide } }) => {
			ide.cache("key", "1");
			const cachedValue = ide.getFromCache("key", "2");

			return v("div", [cachedValue]);
		});

		const h = harness(() => w(App, {}), { middleware: [[ide, ideMock]] });
		h.expect(() => v("div", ["1"]));
	});
});
