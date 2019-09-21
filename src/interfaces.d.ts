import { DimensionResults } from "@dojo/framework/core/meta/Dimensions";
import { WidgetProperties } from "@dojo/framework/core/interfaces";

/**
 * @type UIInstWidget
 *
 * 编辑器专用的 UI 部件，在渲染时使用
 *
 * @property id                 页面中的部件标识
 * @property parentId           页面中父部件标识，根部件的父标识为 -1
 * @property widgetId           部件标识
 * @property widgetName         部件名称
 * @property widgetCode         部件编码
 * @property canHasChild        是否能包含子部件
 * @property properties         部件属性
 * @property overlay            是否在部件上添加遮盖层，默认为 false
 */
export interface AttachedWidget {
	id: string;
	parentId: string;
	widgetId: number;
	widgetName: string;
	widgetCode: string;
	canHasChildren: boolean;
	properties: AttachedWidgetProperties;
}

export interface AttachedWidgetProperties extends WidgetProperties {
	id: string;
	value: string;
	[propName: string]: any;
}

/**
 * @type EditableWidgetProperties
 *
 * 编辑器专用部件属性
 */
export interface EditableWidgetProperties extends WidgetProperties {
	widget: AttachedWidget;
	onMouseUp?: (event: MouseEvent) => void;
	onFocus: (payload: { activeWidgetDimensions: Readonly<DimensionResults>; activeWidgetId: string | number }) => void;
	activeWidgetId: string | number;
}
