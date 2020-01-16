import { create } from "@dojo/framework/core/vdom";
import store from "../store";
import { PageData } from "../interfaces";

const factory = create({ store });

export default factory(function pageData({ middleware: { store } }) {
	return {
		get(): PageData[] {
			return store.get(store.path("pageModel", "data")) || [];
		}
	};
});
