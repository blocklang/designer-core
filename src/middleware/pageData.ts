import { create } from "@dojo/framework/core/vdom";
import { PageDataItem } from "../interfaces";
import * as blocklang from "../blocklang";

const store = blocklang.getStoreMiddleware();
const factory = create({ store });

export default factory(function pageData({ middleware: { store } }) {
	return {
		get(): PageDataItem[] {
			return store.get(store.path("pageModel", "data")) || [];
		},
	};
});
