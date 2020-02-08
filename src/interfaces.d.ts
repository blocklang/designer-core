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
 * 属性部件专用，用于设置单个属性。
 *
 * 如果需要部件信息，则获取当前选中的部件。
 *
 * @property index            当前的 property 在 Widget 的 properties 数组中的索引，用于定位属性信息
 * @property value            用于为属性部件设置默认值，如果没有默认值则不设置
 * @event onPropertyChanged   当属性值发生变化后触发的事件
 * @event onChangePaneLayout  用于切换面板，有的属性不能在当前属性面板中设置，需要切换到新的面板，或者切换到行为视图中去设置
 */
interface SingleProperty {
	index: number; // 部件的属性是按照数组存储的，一个属性对应一条记录，该属性指当前属性在数组中的索引
	value?: string;
	onPropertyChanged: (changedProperty: ChangedPropertyValue) => void; // TODO: 即能传入单个对象，也能传入数组？
	// 当出现页面跳转时，需要记录下 propertyIndex
	onChangePaneLayout: (propertyIndex: number, paneLayout: Partial<PaneLayout>) => void;
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

/**
 * @interface Project
 *
 * 项目基本信息
 *
 * @property id                项目标识
 * @property name              项目名称
 * @property createUserName    项目创建者名称
 */
export interface Project {
	id: number;
	name: string;
	createUserName: string;
}

/**
 * @interface WidgetRepo
 *
 * 主要描述 API 部件仓库中的部件信息
 *
 * @property apiRepoId         API 仓库标识
 * @property apiRepoName       API 仓库名称，对应于 api.json 中的 name 属性
 * @property widgetCategories  分组的部件信息
 */
export interface WidgetRepo {
	apiRepoId: number;
	apiRepoName: string;
	widgetCategories: WidgetCategory[];
}

/**
 * @interface WidgetCategory
 *
 * @property name      分类名称，如果未分类，则值为 “_”
 * @property widgets   部件列表
 */
export interface WidgetCategory {
	name: string;
	widgets: Widget[];
}

/**
 * @interface ComponentRepo
 *
 * 组件仓库
 *
 * @property id                 组件仓库标识
 * @property apiRepoId          该组件仓库实现的 API 仓库标识
 * @property gitRepoWebsite     托管该组件仓库的域名或者 ip 地址
 * @property gitRepoOwner       组件仓库的拥有者，是在托管网站上注册用户的登录名
 * @property gitRepoName        组件仓库的仓库名
 * @property name               组件仓库的名称，是在 component.json 中配置的名称
 * @property category           组件库分类
 * @property version            组件库的版本号，此版本不是组件库的最新版本，而是项目当前依赖的版本
 * @property std                是否标准库
 */
export interface ComponentRepo {
	id: number;
	apiRepoId: number;
	gitRepoWebsite: string;
	gitRepoOwner: string;
	gitRepoName: string;
	name: string;
	category: string;
	version: string;
	std: boolean;
}

/**
 * 页面模型
 *
 * @property pageId      页面标识
 * @property widgets     页面中的部件列表，widgets 的排列结构如下：
 *
 * 1. 一个页面只能有一个根节点；
 * 1. widgets 的第一个节点必须是根节点；
 * 1. 直属子部件紧跟父部件之后，如
 *    ```text
 *    Page
 *       Node1
 *          Node11
 *             Node111
 *          Node12
 *       Node2
 *    ```
 *
 * @property data      页面数据
 */
export interface PageModel {
	pageId: number;
	widgets: AttachedWidget[];
	data: PageDataItem[];
}

export type PageDataItemValueType = "String" | "Number" | "Date" | "Boolean" | "Object" | "Array";

/**
 * 页面数据项。
 *
 * 页面数据是由多条有父子关系的数据项组成。
 *
 * @property id         页面数据标识
 * @property parentId   数据项的父标识
 * @property name       变量名
 * @property value      变量的值
 * @property type       变量值的类型
 * @property open       如果包含子数据项，是否展开，默认为不展开
 */
export interface PageDataItem {
	id: string;
	parentId: string;
	name: string;
	value?: string;
	type: PageDataItemValueType;
	open: boolean;
}

/**
 * @type EditMode
 *
 * 编辑模式:
 *
 * 1. Preview: 预览
 * 2. Edit: 编辑
 */
export type EditMode = "Preview" | "Edit";

/**
 * @type ViewType
 *
 * 一个页面的元素分为：
 *
 * 1. ui: 界面
 * 2. behavior: 行为或交互
 */
export type PageViewType = "ui" | "behavior";

/**
 * @type FuncViewType
 *
 * 函数面板类型：
 *
 * 1. list: 显示函数列表的视图
 * 2. item: 显示单个单数的定义视图
 */
export type FuncViewType = "funcList" | "funcItem";

/**
 * @type PaneLayout
 *
 * 控制编辑器中当前显示的面板。
 *
 * 当前支持三个层级：
 *
 * ```text
 * editMode
 *     Preview
 *     Edit
 *         ui
 *         behavior
 *             func_list
 *             func_item
 * ```
 *
 * @property editMode        设计器的编辑模式
 * @property pageViewType    页面视图类型，分为界面和行为
 * @property funcViewType    函数视图类型，分为函数列表和函数详情
 */
export interface PaneLayout {
	editMode: EditMode;
	pageViewType: PageViewType;
	funcViewType: FuncViewType;
}

/**
 * @type State
 *
 * 设计器的共享状态
 *
 * @property project                       项目基本信息
 * @property widgetRepos                   项目依赖的所有 widget，类型为 widget 的 API 库，按 API 库分组。
 * @property ideRepos                      项目依赖的 ide 组件库信息
 * @property pageModel                     页面模型
 * @property selectedWidgetIndex           当前选中的部件索引，是相对于全页面的索引
 * @property activeWidgetDimensions        当前选中部件的位置和大小信息等
 * @property selectedWidgetPropertyIndex   可选，当前选中的事件在属性列表中的索引，是相对于当前选中的部件，要跟 selectedWidgetIndex 结合使用
 * @property highlightWidgetIndex          高亮显示部件的索引，是相对于全页面的索引
 * @property highlightWidgetDimensions     高亮显示部件的位置和大小信息等
 * @property selectedBehaviorIndex         当前选中的行为元素（包括 data 和 method）的索引，是相对于全页面的索引
 * @property dirty                         判断是否有未保存的内容，如果有则 dirty 的值为 true，否则 dirty 的值为 false，默认为 false
 * @property paneLayout                    定义设计器面板的布局
 */
export interface State {
	project: Project;
	widgetRepos: WidgetRepo[];
	ideRepos: ComponentRepo[];
	pageModel: PageModel;
	// ui 的焦点信息
	selectedWidgetIndex: number;
	activeWidgetDimensions: DimensionResults;
	// behavior 面板中选中的部件事件的索引
	selectedWidgetPropertyIndex: number;
	// 页面中高亮显示部件的信息
	highlightWidgetIndex: number;
	highlightWidgetDimensions: DimensionResults;
	// behavior 的焦点信息，data 和 method 共享焦点信息
	selectedBehaviorIndex: number;
	// 数据操作状态：保存
	dirty: boolean;
	paneLayout: PaneLayout;
}
