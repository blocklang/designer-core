import { DimensionResults } from "@dojo/framework/core/meta/Dimensions";
import { WidgetProperties } from "@dojo/framework/core/interfaces";

/**
 * @type Widget
 *
 * UI 部件信息
 *
 * @property widgetId           部件标识
 * @property widgetName         部件名称
 * @property widgetCode         部件编码
 * @property canHasChildren     是否可以包含子部件
 * @property apiRepoId          部件所属的 API 库标识
 * @property properties         部件的属性列表，要按顺序加载全部属性
 */
export interface Widget {
	widgetId: number;
	widgetName: string;
	widgetCode: string;
	canHasChildren: boolean;
	apiRepoId: number;
	properties: WidgetProperty[];
}

export type PropertyValueType = "string" | "int" | "float" | "date" | "boolean" | "function";

/**
 * @interface WidgetProperty
 *
 * @property code           属性编码，是属性的基本信息，此字段要存入到页面模型中
 * @property name           属性名，此字段仅做显示用，如果 label 有值则优先使用 label 的值
 * @property defaultValue   属性的默认值
 * @property valueType      属性值类型,支持 string、int、float、date、boolean 和 function 类型
 */
export interface WidgetProperty {
	code: string;
	name: string;
	defaultValue?: string;
	valueType: PropertyValueType;
}

/**
 * @interface AttachedWidget
 *
 * 添加到页面中的部件信息
 *
 * @property id          部件 id，部件添加到页面中后，新生成的 id
 * @property parentId    部件的父 id，也是添加到页面中后，之前生成的 id
 * @property properties  部件的属性列表，不论是否有值，都要加载全部属性
 */
export interface AttachedWidget extends Widget {
	id: string;
	parentId: string;

	properties: AttachedWidgetProperty[];
}

/**
 * @interface AttachedWidgetProperty
 *
 * 部件添加到页面后，部件的属性信息
 *
 * @property id         属性标识，是部件添加到页面之后重新生成的 id
 * @property value      属性值
 * @property isExpr     属性值是不是包含表达式，默认为 false
 */
export interface AttachedWidgetProperty extends WidgetProperty {
	id: string;
	value?: string;
	isExpr: boolean;
}

/**
 * @type EditableProperties
 *
 * 将常规的部件转换为可在设计器中集成的部件时，需要扩充或覆盖的属性。
 *
 * @property autoFocus            页面渲染完成后，对应的部件是否自动获取焦点，通过此属性设置页面的默认聚焦部件，默认为 false
 * @property onFocusing           当部件正在获取焦点时触发的事件
 * @property onFocused            当部件已经获取焦点之后出发的事件
 * @property onHighlight          当高亮显示部件时触发的事件
 * @property onUnhighlight        当撤销高亮显示部件时触发的事件
 * @property onPropertyChanged    当需要直接在部件上编辑某一个属性时触发该事件
 */
export interface EditableProperties {
	// 以下为聚焦相关的属性
	// widgetId 传入的是当前部件的 id，用于跟 activeWidgetId 对比，判断是否需要聚焦
	autoFocus?: (widgetId: string) => boolean;
	// 将聚焦过程分为两个阶段
	// 一个是正在聚焦，用于设置聚焦的部件 id
	// 一个是聚焦完成，用于设置聚焦部件的尺寸信息
	onFocusing: (activeWidgetId: string) => void;
	onFocused: (activeWidgetDimensions: Readonly<DimensionResults>) => void;

	// 以下为高亮相关的属性
	// 注意，不需要将高亮事件拆分为两个阶段，因为目前只在此一处调用，且一定会同时传这两个属性
	onHighlight: (payload: {
		highlightWidgetId: string;
		highlightWidgetDimensions: Readonly<DimensionResults>;
	}) => void;
	onUnhighlight: () => void;
	onPropertyChanged?: (changedProperty: ChangedPropertyValue) => void;
}

/**
 * @type EditableWidgetProperties
 *
 * 为在编辑器中集成的部件定义统一的接口。
 *
 * 注意，部件的常规属性存储在 widget 属性中。
 *
 * @property widget                部件基本信息和属性信息，以及放入页面后新增的信息，如 id 和 parentId
 * @property extendProperties      部件的扩展属性，支持在设计器中交互
 */
export interface EditableWidgetProperties extends WidgetProperties {
	widget: AttachedWidget;
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
 * @property widget             **预览**页面时使用的部件类型，是基于类的部件，继承自 WidgetBase 类
 * @property ideWidget          **设计**页面时使用的部件类型，是基于类的部件，通常继承自 widget 的值
 * @property propertiesLayout   部件的属性面板布局信息
 */
interface WidgetMeta {
	widget: any;
	ideWidget: any;
	propertiesLayout: Array<PropertyLayout>;
}

/**
 * 属性名与部件及其属性布局信息的对应关系
 */
export interface ExtensionWidgetMap {
	[propName: string]: WidgetMeta;
}

/**
 * @type ChangedPropertyValue
 *
 * 存储修改的属性值，onPropertyChanged 事件的参数
 *
 * @property index        当前的 property 在 Widget 的 properties 数组中的索引，用于定位属性信息
 * @property newValue     新设置的值
 * @property isChanging   是否属于试衣式设置值，true 表示属性值正在变化中，即处于试衣过程中；false 表示已选定最终值
 * @property isExpr       默认为 false。newValue 的值是表达式，还是字面值，true 表示绑定的是表达式，即变量名或方法名等；false 表示是字面值
 */
interface ChangedPropertyValue {
	index: number;
	newValue: string;
	// 属性值的设置过程有两种：
	// 1. 直接设置最终值，即直接生效
	// 2. 试衣式设置值，即尝试设置不同的值，然后选取一个最终值，此种情况主要用于类似 Slider 部件
	isChanging: boolean;
	// 如果 isExpr 的值为 true，则需要增加解析环节
	isExpr: boolean;
}

/**
 * 传给属性部件的属性，规范所有属性部件的属性接口
 *
 * 属性部件分两类：一是只能设置一个属性；二是只能设置多个属性。
 *
 */

/**
 * 属性部件专用，用于设置单个属性
 *
 * @property index            当前的 property 在 Widget 的 properties 数组中的索引，用于定位属性信息
 * @property value            用于为属性部件设置默认值，如果没有默认值则不设置
 * @event onPropertyChanged   当属性值发生变化后触发的事件
 */
interface SingleProperty {
	index: number; // 部件的属性是按照数组存储的，一个属性对应一条记录，该属性指当前属性在数组中的索引
	value?: string;
	onPropertyChanged: (changedProperty: ChangedPropertyValue) => void; // TODO: 即能传入单个对象，也能传入数组？
}

// 预留
interface MultipleProperties {}

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
