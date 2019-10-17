import { DNode, Constructor, VNode } from "@dojo/framework/core/interfaces";
import { WidgetBase } from "@dojo/framework/core/WidgetBase";
import { afterRender } from "@dojo/framework/core/decorators/afterRender";
import { beforeProperties } from "@dojo/framework/core/decorators/beforeProperties";
import { EditableWidgetProperties } from "../interfaces";
import Dimensions from "@dojo/framework/core/meta/Dimensions";
import { w } from "@dojo/framework/core/vdom";
import Overlay from "../widgets/overlay";

interface WidgetDesignableMixin {
	properties: EditableWidgetProperties;
}

const ROOT_WIDGET_PARENT_ID = "-1";

/**
 * 将普通的用户自定义部件转换为可在设计器中使用的部件，提供以下扩展：
 * 1. 测量部件尺寸
 * 2. 增加遮盖层屏蔽部件中与设计器冲突的事件
 * 3. 覆盖部件的获取焦点效果
 * 4. 为空容器增加可视化效果
 *
 * @param Base
 */
export function WidgetDesignableMixin<T extends new (...args: any[]) => WidgetBase>(
	Base: T
): T & Constructor<WidgetDesignableMixin> {
	abstract class WidgetDesignable extends Base {
		public abstract properties: EditableWidgetProperties;
		private _key: string = "";

		/**
		 * 问题描述
		 * 部件聚焦时，当通过修改属性值调整聚焦部件的位置且不会触发 Resize Observer 时，
		 * 如调整 Float 的值，则需要一种方法来触发聚焦部件的重绘方法以获取正确的位置信息（用于重绘聚焦框）。
		 *
		 * 注意，Resize Observer 只有在改变了 DOM 节点的 content rect size 时才会触发，而如果将 float 的值从 left 改为 right 时，
		 * DOM 节点的位置发生了变化，而 rect size 并没有发生变化，
		 * 所以没有触发 Resize Observer，参见 https://wicg.github.io/ResizeObserver/#content-rect。
		 *
		 * 解决方法
		 *
		 * 在聚焦部件后添加一个子节点，然后在子部件上传入 deferred properties 来延迟触发 tryFocus 方法，
		 * 即每次绘制完聚焦部件后，都会调用 tryFocus 方法，从而获取到正确的位置信息，实现聚焦框的准确定位。
		 */
		// private _triggerResizeWidgetKey: string = '__triggerResize__'; // 如果是系统内使用的字符串，则在字符串的前后分别增加两个 '_'

		@beforeProperties()
		protected beforeProperties(properties: EditableWidgetProperties) {
			console.log("widget designable beforeProperties");
			console.log("can has children:", this.canHasChildren(properties.widget.canHasChildren));
			return properties;
		}

		@afterRender()
		protected afterRender(result: DNode | DNode[]): DNode | DNode[] {
			// 一个部件可能返回一到多个 DNode，大多数情况下只返回一个 DNode，但也会返回多个 DNode
			// 如果只返回一个 DNode，则在此 DNode 上添加 onMouseUp 事件
			// 此时需要根据 key 的值找到这个 DNode

			let resultArray;
			if (Array.isArray(result)) {
				resultArray = result;
			} else {
				this._key = (result as VNode).properties.key as string;
				resultArray = [result];
			}

			this._autoFocus();

			if (this.needOverlay()) {
				const dimensions = this.meta(Dimensions).get(this._key);
				const top = dimensions.offset.top;
				const left = dimensions.offset.left;
				const height = dimensions.size.height;
				const width = dimensions.size.width;

				return [
					...resultArray,
					w(Overlay, {
						top,
						left,
						height,
						width,
						onmouseup: this._onMouseUp,
						onmouseover: this._onMouseOver,
						onmouseout: this._onMouseOut
					})
				];
			}

			const bindMouseUpEventNode = result as VNode;
			// 一、当用鼠标点击部件时，让部件获取焦点
			bindMouseUpEventNode.properties.onmouseup = this._onMouseUp;
			// 添加高亮显示部件
			bindMouseUpEventNode.properties.onmouseover = this._onMouseOver;
			// 移除高亮显示部件
			bindMouseUpEventNode.properties.onmouseout = this._onMouseOut;

			return result;
		}

		/**
		 * 是否可以包含子部件，能包含子部件则返回 true，不能包含子部件则返回 false。
		 *
		 * canHasChildren 已经在部件的基本信息中指定。
		 */
		protected canHasChildren(defaultValue?: boolean): boolean {
			return defaultValue || false;
		}

		/**
		 * 当前部件是否需要添加遮盖层。
		 *
		 * 默认不添加，可在设计器版部件中设置。
		 */
		protected needOverlay(): boolean {
			return false;
		}

		private _onMouseUp(event: MouseEvent) {
			event.stopImmediatePropagation();

			this._tryFocus();
		}

		private _onMouseOver(event: MouseEvent) {
			event.stopImmediatePropagation();

			this._addHighlight();
		}

		private _onMouseOut(event: MouseEvent) {
			event.stopImmediatePropagation();

			this._removeHighlight();
		}

		/**
		 * 页面加载完后，默认聚焦的部件，发生在页面初始化阶段。
		 */
		private _autoFocus() {
			const { autoFocus } = this.properties.extendProperties;
			const {
				widget: { id: widgetId }
			} = this.properties;

			// 此段代码不能放到 beforeRender 中，因为此时 this._key 尚未设置值
			if (autoFocus && autoFocus(widgetId)) {
				this._tryFocus();
			}
		}

		/**
		 * 此方法只能在获取到聚焦节点自身的 key 值后才能调用。
		 */
		private _tryFocus() {
			const {
				widget,
				extendProperties: { onFocus }
			} = this.properties;
			const activeWidgetDimensions = this.meta(Dimensions).get(this._key);
			const activeWidgetId = widget.id;
			onFocus && onFocus({ activeWidgetDimensions, activeWidgetId });
		}

		private _addHighlight() {
			const {
				widget: { id: highlightWidgetId },
				extendProperties: { onHighlight }
			} = this.properties;
			if (!onHighlight) {
				return;
			}

			const highlightWidgetDimensions = this.meta(Dimensions).get(this._key);
			// 添加高亮效果
			onHighlight({ highlightWidgetDimensions, highlightWidgetId });
		}

		private _removeHighlight() {
			const {
				widget,
				extendProperties: { onHighlight }
			} = this.properties;
			if (!onHighlight) {
				return;
			}
			if (widget.parentId === ROOT_WIDGET_PARENT_ID) {
				// 移除高亮效果
				onHighlight({});
			}
		}

		// private _reRenderFocusBox(): DNode {
		// 	const { autoFocus } = this.properties.extendProperties;
		// 	const {
		// 		widget: { id: widgetId }
		// 	} = this.properties;

		// 	if (autoFocus && autoFocus(widgetId)) {
		// 		// 防止渲染多个 triggerResizeWidget 造成 key 重复报错
		// 		return v('virtual', () => {
		// 			this._tryFocus();
		// 			return { key: this._triggerResizeWidgetKey };
		// 		});
		// 	}
		// 	return null;
		// }
	}
	return WidgetDesignable;
}

export default WidgetDesignableMixin;
