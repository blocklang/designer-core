const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import { stub } from "sinon";

import Overlay from "../../../../src/widgets/overlay";
import * as css from "../../../../src/widgets/overlay/index.m.css";

describe("overlay", () => {
	it("default properties", () => {
		const properties = { left: 0, top: 0, height: 0, width: 0, onmouseup: () => {} };
		const h = harness(() => <Overlay {...properties} />);

		h.expect(() => (
			<div
				key="overlay"
				classes={[css.root]}
				styles={{ top: "0px", left: "0px", height: "0px", width: "0px" }}
				onmouseup={() => {}}
			></div>
		));
	});

	it("trigger onmouseup", () => {
		const onmouseupStub = stub();
		const properties = { left: 0, top: 0, height: 0, width: 0, onmouseup: onmouseupStub };
		const h = harness(() => <Overlay {...properties} />);
		h.trigger("@overlay", "onmouseup");
		assert.isTrue(onmouseupStub.calledOnce);
	});
});
