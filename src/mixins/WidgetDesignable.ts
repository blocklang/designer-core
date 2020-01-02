import { DNode, Constructor, VNode } from "@dojo/framework/core/interfaces";
import { WidgetBase } from "@dojo/framework/core/WidgetBase";
import { afterRender } from "@dojo/framework/core/decorators/afterRender";
import { beforeProperties } from "@dojo/framework/core/decorators/beforeProperties";
import { EditableWidgetProperties, AttachedWidgetProperty } from "../interfaces";
import Dimensions from "@dojo/framework/core/meta/Dimensions";
import { w, v } from "@dojo/framework/core/vdom";
import Overlay from "../widgets/overlay";
import { findIndex } from "@dojo/framework/shim/array";

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

		// 是否可以在部件中修改指定属性的值
		// 判断逻辑为：如果覆写了 getCanEditingPropertyName 函数，并返回了属性
		private _canEditingProperty: boolean = false;
		private _canEditingPropertyIndex: number = -1;

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
		@beforeProperties()
		protected beforeProperties(properties: EditableWidgetProperties) {
			console.log("widget designable beforeProperties");
			console.log("can has children:", this.canHasChildren(properties.widget.canHasChildren));

			this._setEditingPropertyInfo(properties.widget.properties);

			return properties;
		}

		/**
		 * 设置在编辑器中可直接编辑的属性
		 *
		 * @param attachedWidgetProperties
		 */
		private _setEditingPropertyInfo(attachedWidgetProperties: AttachedWidgetProperty[]) {
			const editingPropertyName = this.getCanEditingPropertyName();
			if (!editingPropertyName) {
				this._canEditingProperty = false;
				this._canEditingPropertyIndex = -1;
				return;
			}

			this._canEditingProperty = true;
			this._canEditingPropertyIndex = findIndex(
				attachedWidgetProperties,
				(attachedWidgetProperty) => attachedWidgetProperty.name === editingPropertyName
			);
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
					}),
					this._alwaysRenderFocusBox()
				];
			}

			// TODO: 提取出一个函数，可覆写获取节点的逻辑。
			// 将编辑扩展相关的事件绑定到相关的节点上。
			const bindEditableEventsNode = result as VNode;
			// 一、当用鼠标点击部件时，让部件获取焦点
			bindEditableEventsNode.properties.onmouseup = this._onMouseUp;
			// 添加高亮显示部件
			bindEditableEventsNode.properties.onmouseover = this._onMouseOver;
			// 移除高亮显示部件
			bindEditableEventsNode.properties.onmouseout = this._onMouseOut;
			// 支持在部件中编辑属性
			if (this._canEditingProperty) {
				// 默认绑定到 oninput 事件上，后续按需扩展
				const {
					extendProperties: { onPropertyChanged }
				} = this.properties;

				if (onPropertyChanged) {
					bindEditableEventsNode.properties.oninput = (event: KeyboardEvent) => {
						// 当属性值发生变化时，要发出通知
						const tagName = (event.target as HTMLElement).tagName;
						let value = "";
						if (tagName === "SPAN") {
							value = (event.target as HTMLSpanElement).textContent || "";
						} else {
							value = (event.target as HTMLInputElement).value;
						}
						onPropertyChanged({
							index: this._canEditingPropertyIndex,
							newValue: value,
							isChanging: false,
							isExpr: false
						});
					};
				}
			}

			return [...resultArray, this._alwaysRenderFocusBox()];
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

		/**
		 * 设置在部件中可直接编辑的属性。默认为不在部件中编辑任何属性。
		 *
		 * 有两处可以编辑属性：
		 * 1. 在属性面板中编辑各个属性；
		 * 2. 在部件中直接编辑指定的属性，在部件中最多只能编辑一个属性；
		 */
		protected getCanEditingPropertyName(): string | undefined {
			return;
		}

		private _alwaysRenderFocusBox(): DNode<any> {
			if (!this._shouldFocus()) {
				return;
			}
			return v("span", (inserted: boolean) => {
				this._measureActiveWidget();
				// 如果是系统内使用的字符串，则在字符串的前后分别增加两个 '_'
				return { key: "__alwaysRenderFocusBox__" };
			});
		}

		private _shouldFocus() {
			const { autoFocus } = this.properties.extendProperties;
			const {
				widget: { id: widgetId }
			} = this.properties;

			return autoFocus && autoFocus(widgetId);
		}

		private _onMouseUp(event: MouseEvent) {
			event.stopImmediatePropagation();
			// 应该在此处调整 activeWidgetId 的值，而不调整 activeDimensions 的值
			this._setActiveWidgetId();
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
		 * 此方法只能在获取到聚焦节点自身的 key 值后才能调用。
		 *
		 * 注意，先设置聚焦部件 id，然后再调用 _measureActiveWidget 测量部件
		 */
		private _setActiveWidgetId() {
			const {
				widget,
				extendProperties: { onFocusing }
			} = this.properties;

			const activeWidgetId = widget.id;
			onFocusing(activeWidgetId);
		}

		private _measureActiveWidget() {
			const {
				extendProperties: { onFocused }
			} = this.properties;

			const activeWidgetDimensions = this.meta(Dimensions).get(this._key);
			onFocused(activeWidgetDimensions);
		}

		private _addHighlight() {
			const {
				widget: { id: highlightWidgetId },
				extendProperties: { onHighlight }
			} = this.properties;

			const highlightWidgetDimensions = this.meta(Dimensions).get(this._key);
			// 添加高亮效果
			onHighlight({ highlightWidgetId, highlightWidgetDimensions });
		}

		private _removeHighlight() {
			const {
				widget,
				extendProperties: { onUnhighlight }
			} = this.properties;

			if (widget.parentId === ROOT_WIDGET_PARENT_ID) {
				// 移除高亮效果
				onUnhighlight();
			}
		}
	}
	return WidgetDesignable;
}

export default WidgetDesignableMixin;
