import { create } from "@dojo/framework/core/vdom";
import { EditableWidgetProperties, AttachedWidgetProperty } from "../interfaces";
import * as blocklang from "../blocklang";
import { findIndex } from "@dojo/framework/shim/array";

const ROOT_WIDGET_PARENT_ID = "-1";
const dimensions = blocklang.getDimensionsMiddleware();

const factory = create({ dimensions }).properties<EditableWidgetProperties>();

export const ideMiddleware = factory(({ properties, middleware: { dimensions } }) => {
	let _nodeKey: string;
	let _canEditingPropertyIndex: number = -1;

	function setActiveWidgetId(): void {
		const {
			widget,
			extendProperties: { onFocusing }
		} = properties();

		const activeWidgetId = widget.id;
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
			widget,
			extendProperties: { onUnhighlight }
		} = properties();

		if (widget.parentId === ROOT_WIDGET_PARENT_ID) {
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
					if (!_nodeKey) {
						console.warn("请先调用 setKey() 函数设置 node 的 key 值");
						return;
					}
					event.stopImmediatePropagation();
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
			const {
				extendProperties: { onPropertyChanged }
			} = properties();

			onPropertyChanged({
				index: _canEditingPropertyIndex,
				newValue: value,
				isChanging: false,
				isExpr: false
			});
		}
	};
});

export default ideMiddleware;
