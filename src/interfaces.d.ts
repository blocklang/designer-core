import { DimensionResults } from "@dojo/framework/core/meta/Dimensions";
import { WidgetProperties } from "@dojo/framework/core/interfaces";

// 关于 AttachedWidget 和 InstWidget 两个名字的区别：
// 1. 两个多表示添加到页面中的部件信息；
// 2. InstWidget 是由 AttachedWidget 转换来的，是更贴近于部件的数据格式;
// 3. InstWidget 中的属性在渲染时候使用，而 AttachedWiget 是在定义关系时使用。

/**
 * @type InstWidget
 *
 * 存储两类信息：
 *
 * 1. Widget 基本信息
 * 2. Widget 放到页面之后新增的信息
 *
 * @property id                 页面中的部件标识
 * @property parentId           页面中父部件标识，根部件的父标识为 -1
 * @property widgetName         部件名称
 * @property widgetCode         部件编码
 * @property canHasChildren     是否能包含子部件
 */
export interface InstWidget {
	id: string;
	parentId: string;
	widgetName: string;
	widgetCode: string;
	canHasChildren: boolean;
}

/**
 * @type InstWidgetProperties
 *
 * 部件的属性值
 */
export interface InstWidgetProperties extends WidgetProperties {
	[propName: string]: any;
}

/**
 * @type EditableProperties
 *
 * 将常规的部件转换为可在设计器中集成的部件时，需要扩充或覆盖的属性。
 *
 * @property autoFocus        页面渲染完成后，对应的部件是否自动获取焦点，通过此属性设置页面的默认聚焦部件，默认为 false
 * @property onFocus          当部件获取焦点后触发的事件
 * @property onHighlight      当高亮显示部件时触发的事件，如果存在 highlightWidgetDimensions 参数，则显示高亮效果，否则删除高亮效果
 */
export interface EditableProperties {
	// widgetId 传入的是当前部件的 id，用于跟 activeWidgetId 对比，判断是否需要聚焦
	autoFocus?: (widgetId: string) => boolean;
	// 以下为聚焦相关的属性
	onFocus: (payload: { activeWidgetDimensions: Readonly<DimensionResults>; activeWidgetId: string }) => void;

	// 以下为高亮相关的属性
	onHighlight: (payload: {
		highlightWidgetDimensions?: Readonly<DimensionResults>;
		highlightWidgetId?: string;
	}) => void;
}

/**
 * @type EditableWidgetProperties
 *
 * 为在编辑器中集成的部件定义统一的接口。
 *
 * @property widget                部件基本信息以及放入页面后新增的信息
 * @property originalProperties    部件的常规属性
 * @property extendProperties      部件的扩展属性，支持在设计器中交互
 */
export interface EditableWidgetProperties extends WidgetProperties {
	widget: InstWidget;
	originalProperties: InstWidgetProperties;
	extendProperties: EditableProperties;
}

/****************以下为第三方组件库的模型*****************/

// FIXME: 此接口中的值需要逐步细化

/**
 * 属性分隔符，分为垂直、水平和中划线三种
 */
type Divider = "vertical" | "horizontal" | "segement";
/**
 * 部件定位，{self} 表示当前部件；{parent} 表示当前部件的父部件
 */
type WidgetPointer = "{self}" | "{parent}";

interface PropertyTarget {
	[index: number]: string | { widget: WidgetPointer; propertyName: string };
}

/**
 * 一个属性布局信息
 *
 * @property propertyLabel    属性的显示名
 * @property propertyWidget   属性部件
 * @property propertyName     属性名
 * @property propertyGroup    属性组，将多个属性组合在一个属性布局中
 * @property if               只有满足 if 条件，才显示对应的属性部件
 * @property target           当多个属性在一个属性部件中展示的时候，在此标识出对应的多个属性
 */
interface PropertyLayout {
	propertyLabel: string;
	propertyWidget: any;
	propertyName?: string;
	propertyGroup?: { propertyName?: string; target?: string[]; divider?: Divider }[];
	if?: { widget: WidgetPointer; propertyName: string; propertyValue: string[] };
	// 如果是针对当前部件的，则直接填写属性名，否则指定部件地址信息
	target?: PropertyTarget;
}

/**
 * 部件元信息
 *
 * @property widget             部件类型，是基于类的部件，继承自 WidgetBase 类
 * @property propertiesLayout   部件的属性面板布局信息
 */
interface WidgetMeta {
	widget: any;
	propertiesLayout: Array<PropertyLayout>;
}

/**
 * 属性名与部件及其属性布局信息的对应关系
 */
export interface ExtensionWidgetMap {
	[propName: string]: WidgetMeta;
}

/**
 * @type GitUrlSegment
 *
 * git 仓库的地址信息
 *
 * @property website     网址，如 github.com
 * @property owner       仓库拥有者，如 blocklang
 * @property repoName    仓库名，如 designer-core
 */
export interface GitUrlSegment {
	website: string;
	owner: string;
	repoName: string;
}
