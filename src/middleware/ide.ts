import { create, v } from "@dojo/framework/core/vdom";
import { findIndex } from "@dojo/framework/shim/array";
import { TopLeft, Size } from "@dojo/framework/core/meta/Dimensions";
import { VNode } from "@dojo/framework/core/interfaces";
import * as blocklang from "../blocklang";
import { EditableWidgetProperties, AttachedWidgetProperty } from "../interfaces";

const ROOT_WIDGET_PARENT_ID = "-1";
const dimensions = blocklang.getDimensionsMiddleware();
const icache = blocklang.getICacheMiddleware();

const factory = create({ dimensions, icache }).properties<EditableWidgetProperties>();

export const ide = factory(({ properties, middleware: { dimensions, icache } }) => {
	let _nodeKey: string;
	let _canEditingPropertyIndex: number = -1;

	function setActiveWidgetId(): void {
		const {
			widget: { id: activeWidgetId },
			extendProperties: { onFocusing }
		} = properties();

		onFocusing(activeWidgetId);
	}

	function addHighlight(key: string): void {
		const {
			widget: { id: highlightWidgetId },
			extendProperties: { onHighlight }
		} = properties();

		const highlightWidgetDimensions = dimensions.get(key);
		// 添加高亮效果
		onHighlight({ highlightWidgetId, highlightWidgetDimensions });
	}

	function removeHighlight(): void {
		const {
			widget: { parentId },
			extendProperties: { onUnhighlight }
		} = properties();

		if (parentId === ROOT_WIDGET_PARENT_ID) {
			// 移除高亮效果
			onUnhighlight();
		}
	}

	function shouldFocus() {
		const {
			widget: { id: widgetId },
			extendProperties: { autoFocus }
		} = properties();

		return autoFocus && autoFocus(widgetId);
	}

	function measureActiveWidget(key: string) {
		const {
			extendProperties: { onFocused }
		} = properties();

		const activeWidgetDimensions = dimensions.get(key);
		onFocused(activeWidgetDimensions);
	}

	function getEditingPropertyIndex(propertyName: string) {
		const {
			widget: { properties: attachedWidgetProperties }
		} = properties();

		return findIndex(
			attachedWidgetProperties,
			(attachedWidgetProperty: AttachedWidgetProperty) => attachedWidgetProperty.name === propertyName
		);
	}

	return {
		/**
		 * 用于初始化配置。必须调用。
		 *
		 * 在基于函数的部件的最上面调用以下代码：
		 *
		 * ```ts
		 * ide.config("root");
		 * ide.tryFocus();
		 * ```
		 *
		 * @param key                    节点的 key 值，需要根据此节点丈量当前部件的位置和尺寸。
		 * @param editingPropertyName    如果要直接在部件中编辑某个属性，通过此属性指定属性名。
		 */
		config(key: string, editingPropertyName?: string) {
			_nodeKey = key;
			if (editingPropertyName) {
				_canEditingPropertyIndex = getEditingPropertyIndex(editingPropertyName);
			}
		},

		/**
		 * 永远重新渲染激活的部件。
		 *
		 * 注意，目前不支持 tsx，只支持 HyperScript。约定放在所有节点之后。
		 *
		 * 如果部件当前获取焦点，则测量该部件的位置和尺寸，并向父部件发出通知。
		 *
		 * @returns 返回 DNode 节点或者 undefined
		 */
		alwaysRenderActiveWidget(): VNode | undefined {
			if (!shouldFocus()) {
				return;
			}
			if (!_nodeKey) {
				console.warn("请先调用 config() 函数设置 node 的 key 值");
				return;
			}

			return v("span", (inserted: boolean) => {
				measureActiveWidget(_nodeKey);
				// 如果是系统内使用的字符串，则在字符串的前后分别增加两个 '_'
				return { key: "__alwaysRenderFocusBox__" };
			});
		},

		/**
		 * 获取为当前部件上绑定的 ide 相关的事件，分别为 `onmouseup`、`onmouseover` 和 `onmouseout`。
		 */
		activeWidgetEvents() {
			return {
				onmouseup: (event: MouseEvent) => {
					event.stopImmediatePropagation();
					setActiveWidgetId();
				},
				onmouseover: (event: MouseEvent) => {
					event.stopImmediatePropagation();
					if (!_nodeKey) {
						console.warn("请先调用 setKey() 函数设置 node 的 key 值");
						return;
					}
					addHighlight(_nodeKey);
				},
				onmouseout: (event: MouseEvent) => {
					event.stopImmediatePropagation();
					removeHighlight();
				}
			};
		},

		/**
		 * 仅用于需要在部件中编辑某个属性值时。用于监听对应属性值的变化，并发出通知。
		 *
		 * @param value 当前属性的值
		 */
		changePropertyValue(value: string) {
			if (_canEditingPropertyIndex === -1) {
				console.warn("未配置要编辑的属性名称");
				return;
			}

			const {
				extendProperties: { onPropertyChanged }
			} = properties();

			onPropertyChanged({
				index: _canEditingPropertyIndex,
				newValue: value,
				isChanging: false,
				isExpr: false
			});
		},

		/**
		 * 仅用于需要往部件上添加 Overlay 时，用于设置 Overlay 的位置和尺寸。
		 *
		 * 注意：是否需要添加遮盖层与当前部件是否获取焦点无关，只与部件的本身需要有关。
		 */
		getFocusNodeOffset(): TopLeft & Size {
			const activeWidgetDimensions = dimensions.get(_nodeKey);
			// 注意，聚焦框和高亮框的 top 算法考虑了滚动条，而此处没有考虑。
			// 如果此处也需要考虑滚动条，则将 page_designer 项目中的 calculateOffset 函数移到此项目中
			return {
				top: activeWidgetDimensions.offset.top,
				left: activeWidgetDimensions.offset.left,
				height: activeWidgetDimensions.size.height,
				width: activeWidgetDimensions.size.width
			};
		},

		cache(key: string, value: any) {
			icache.set(key, value);
		},

		getFromCache(key: string, defaultValue: any) {
			return icache.getOrSet(key, defaultValue);
		}
	};
});

export default ide;
