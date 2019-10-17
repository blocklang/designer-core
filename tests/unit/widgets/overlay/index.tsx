const { describe, it } = intern.getInterface("bdd");
const { assert } = intern.getPlugin("chai");

import harness from "@dojo/framework/testing/harness";
import { tsx } from "@dojo/framework/core/vdom";
import { stub } from "sinon";

import Overlay from "../../../../src/widgets/overlay";
import * as css from "../../../../src/widgets/overlay/index.m.css";

describe("overlay", () => {
	it("default properties", () => {
		const properties = {
			left: 0,
			top: 0,
			height: 0,
			width: 0,
			onmouseup: () => {},
			onmouseover: () => {},
			onmouseout: () => {}
		};
		const h = harness(() => <Overlay {...properties} />);

		h.expect(() => (
			<div
				key="overlay"
				classes={[css.root]}
				styles={{ top: "0px", left: "0px", height: "0px", width: "0px" }}
				onmouseup={() => {}}
				onmouseover={() => {}}
				onmouseout={() => {}}
			></div>
		));
	});

	it("trigger onmouseup", () => {
		const onmouseupStub = stub();
		const properties = {
			left: 0,
			top: 0,
			height: 0,
			width: 0,
			onmouseup: onmouseupStub,
			onmouseover: () => {},
			onmouseout: () => {}
		};
		const h = harness(() => <Overlay {...properties} />);
		h.trigger("@overlay", "onmouseup");
		assert.isTrue(onmouseupStub.calledOnce);
	});

	it("trigger onmouseover", () => {
		const onmouseoverStub = stub();
		const properties = {
			left: 0,
			top: 0,
			height: 0,
			width: 0,
			onmouseup: () => {},
			onmouseover: onmouseoverStub,
			onmouseout: () => {}
		};
		const h = harness(() => <Overlay {...properties} />);
		h.trigger("@overlay", "onmouseover");
		assert.isTrue(onmouseoverStub.calledOnce);
	});

	it("trigger onmouseout", () => {
		const onmouseoutStub = stub();
		const properties = {
			left: 0,
			top: 0,
			height: 0,
			width: 0,
			onmouseup: () => {},
			onmouseover: () => {},
			onmouseout: onmouseoutStub
		};
		const h = harness(() => <Overlay {...properties} />);
		h.trigger("@overlay", "onmouseout");
		assert.isTrue(onmouseoutStub.calledOnce);
	});
});
