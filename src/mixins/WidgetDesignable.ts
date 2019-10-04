import { DNode, Constructor, VNode } from "@dojo/framework/core/interfaces";
import { WidgetBase } from "@dojo/framework/core/WidgetBase";
import { afterRender } from "@dojo/framework/core/decorators/afterRender";
import { beforeRender } from "@dojo/framework/core/decorators/beforeRender";
import { beforeProperties } from "@dojo/framework/core/decorators/beforeProperties";
import { EditableWidgetProperties } from "../interfaces";
import Dimensions from "@dojo/framework/core/meta/Dimensions";

interface WidgetDesignableMixin {
	properties: EditableWidgetProperties;
}

const ROOT_WIDGET_PARENT_ID = "-1";

export function WidgetDesignableMixin<T extends new (...args: any[]) => WidgetBase>(
	Base: T
): T & Constructor<WidgetDesignableMixin> {
	abstract class WidgetDesignable extends Base {
		public abstract properties: EditableWidgetProperties;
		private _key: string = "";

		@beforeProperties()
		protected beforeProperties(properties: EditableWidgetProperties) {
			console.log("widget designable beforeProperties");
			console.log("can has children:", this.canHasChildren(properties.widget.canHasChildren));
			return properties;
		}

		@beforeRender()
		protected beforeRender(
			renderFunc: () => DNode | DNode[],
			properties: EditableWidgetProperties,
			children: DNode[]
		) {
			const { autoFocus = false } = properties.extendProperties;
			if (autoFocus) {
				this._tryFocus();
			}
			return renderFunc;
		}

		@afterRender()
		protected afterRender(result: DNode | DNode[]): DNode | DNode[] {
			// 一个部件可能返回一到多个 DNode，大多数情况下只返回一个 DNode，但也会返回多个 DNode
			// 如果只返回一个 DNode，则在此 DNode 上添加 onMouseUp 事件
			// 此时需要根据 key 的值找到这个 DNode
			this._key = (result as VNode).properties.key as string;

			const bindMouseUpEventNode = result as VNode;

			// 一、当用鼠标点击部件时，让部件获取焦点
			bindMouseUpEventNode.properties.onmouseup = this._onMouseUp;
			// 添加高亮显示部件
			bindMouseUpEventNode.properties.onmouseover = this._onMouseOver;
			// 移除高亮显示部件
			bindMouseUpEventNode.properties.onmouseout = this._onMouseOut;

			console.log("widget designable afterRender");

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
	}
	return WidgetDesignable;
}

export default WidgetDesignableMixin;
