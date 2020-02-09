import { create, v, invalidator } from "@dojo/framework/core/vdom";
import dimensions from "@dojo/framework/core/middleware/dimensions";
import { EditableWidgetProperties, AttachedWidgetProperty } from "../../../interfaces";
import { findIndex } from "@dojo/framework/shim/array";
import { DimensionResults } from "@dojo/framework/core/meta/Dimensions";
import { VNode } from "@dojo/framework/core/interfaces";
import Map from "@dojo/framework/shim/Map";

const factory = create({ dimensions }).properties<EditableWidgetProperties>();

const defaultDimensions = {
	client: {
		height: 0,
		left: 0,
		top: 0,
		width: 0
	},
	offset: {
		height: 0,
		left: 0,
		top: 0,
		width: 0
	},
	position: {
		bottom: 0,
		left: 0,
		right: 0,
		top: 0
	},
	scroll: {
		height: 0,
		left: 0,
		top: 0,
		width: 0
	},
	size: {
		width: 0,
		height: 0
	}
};

export function createMockIdeMiddleware() {
	let _dimensionsResult: { [key: string]: DimensionResults } = {};
	const cacheMap = new Map<string, any>();

	const mockIdeFactory = factory(({ properties, middleware }) => {
		let _nodeKey = "";
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

			const highlightWidgetDimensions = _dimensionsResult[key] || defaultDimensions;
			// 添加高亮效果
			onHighlight({ highlightWidgetId, highlightWidgetDimensions });
		}

		function removeHighlight(): void {
			const {
				widget,
				extendProperties: { onUnhighlight }
			} = properties();

			if (widget.parentId === "-1") {
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

			const activeWidgetDimensions = _dimensionsResult[key] || defaultDimensions;
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
			config(key: string, editingPropertyName?: string | undefined): void {
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
			changePropertyValue(value: string) {
				const {
					extendProperties: { onPropertyChanged }
				} = properties();

				onPropertyChanged &&
					onPropertyChanged({
						index: _canEditingPropertyIndex,
						newValue: value,
						isChanging: false,
						isExpr: false
					});
			},
			getFocusNodeOffset() {
				const activeWidgetDimensions = _dimensionsResult[_nodeKey] || defaultDimensions;
				return {
					top: activeWidgetDimensions.offset.top,
					left: activeWidgetDimensions.offset.left,
					height: activeWidgetDimensions.size.height,
					width: activeWidgetDimensions.size.width
				};
			},
			cache(key: string, value: any) {
				cacheMap.set(key, value);
				invalidator();
			},
			getFromCache(key: string, defaultValue: any) {
				return cacheMap.get(key) || defaultValue;
			}
		};
	});

	function mockIde(): any; // TODO: 升级到 7.0 之后，类型调整为 DefaultMiddlewareResult
	function mockIde(key: string, dimensionResults: DimensionResults): void;
	function mockIde(key?: string, dimensionResults?: DimensionResults): void | any {
		if (key) {
			_dimensionsResult[key] = dimensionResults || defaultDimensions;
		} else {
			return mockIdeFactory();
		}
	}

	return mockIde;
}

export default createMockIdeMiddleware;
