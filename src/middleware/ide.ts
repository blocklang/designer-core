import { create } from "@dojo/framework/core/vdom";
import { EditableWidgetProperties, AttachedWidgetProperty } from "../interfaces";
import * as blocklang from "../blocklang";
import { findIndex } from "@dojo/framework/shim/array";
import { TopLeft, Size } from "@dojo/framework/core/meta/Dimensions";

const ROOT_WIDGET_PARENT_ID = "-1";
const dimensions = blocklang.getDimensionsMiddleware();

const factory = create({ dimensions }).properties<EditableWidgetProperties>();

export const ideMiddleware = factory(({ properties, middleware: { dimensions } }) => {
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
		config(key: string, editingPropertyName?: string) {
			_nodeKey = key;
			if (editingPropertyName) {
				_canEditingPropertyIndex = getEditingPropertyIndex(editingPropertyName);
			}
		},
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
		tryFocus() {
			if (shouldFocus()) {
				if (!_nodeKey) {
					console.warn("请先调用 setKey() 函数设置 node 的 key 值");
					return;
				}
				measureActiveWidget(_nodeKey);
			}
		},
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
		// 是否需要添加遮盖层与当前部件是否获取焦点无关，只与部件的本身需要有关。
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
		}
	};
});

export default ideMiddleware;
