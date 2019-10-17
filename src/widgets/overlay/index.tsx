import { create, tsx } from "@dojo/framework/core/vdom";
import * as css from "./index.m.css";

export interface OverlayProperties {
	top: number;
	left: number;
	height: number;
	width: number;
	onmouseup: (event: MouseEvent) => void;
	onmouseover: (event: MouseEvent) => void;
	onmouseout: (event: MouseEvent) => void;
}

const factory = create().properties<OverlayProperties>();

/**
 * 部件的遮盖层，用于屏蔽部件的默认事件、聚焦效果等。
 *
 * 注意，Overlay 只能放在原子部件上，不能放在容器部件上
 */
export default factory(function Overlay({ properties }) {
	const { top, left, height, width, onmouseup, onmouseover, onmouseout } = properties();
	return (
		<div
			key="overlay"
			classes={[css.root]}
			styles={{ top: `${top}px`, left: `${left}px`, height: `${height}px`, width: `${width}px` }}
			onmouseup={onmouseup}
			onmouseover={onmouseover}
			onmouseout={onmouseout}
		></div>
	);
});
