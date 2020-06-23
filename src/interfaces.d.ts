import { WidgetProperties } from "@dojo/framework/core/interfaces";
import { DimensionResults } from "@dojo/framework/core/meta/Dimensions";

/**
 * @type Widget
 *
 * UI 部件信息
 *
 * 注意，此处将属性和事件都存在 properties 中，其中 valueType 为 function 的为事件，其余皆为属性。
 *
 * @property widgetId           部件定义标识
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

export type PropertyValueType = "string" | "int" | "float" | "date" | "boolean" | "function" | "object" | "array";

/**
 * @interface WidgetProperty
 *
 * 部件属性
 *
 * @property code           属性编码，是属性的基本信息，此字段要存入到页面模型中
 * @property name           属性名，此字段仅做显示用，如果 label 有值则优先使用 label 的值
 * @property defaultValue   属性的默认值
 * @property valueType      属性值类型,支持 string、int、float、date、boolean 和 function 类型
 * @property argument       仅用于当 valueType 的值为 function 时，表示事件的输入参数，按顺序排列
 */
export interface WidgetProperty {
	code: string;
	name: string;
	defaultValue?: string;
	valueType: PropertyValueType;
	arguments?: FunctionArgument[];
}

/**
 * @interface AttachedWidget
 *
 * 添加到页面中的部件信息
 *
 * @property id          部件实例标识，即部件添加到页面中后生成的 id
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
 * @property id         属性实例标识，是部件添加到页面之后重新生成的 id
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

/**
 * @interface RepoServiceList
 *
 * 主要描述 API 仓库中的 Service 信息，一个 git repo 中定义的所有 Service。
 *
 * @property apiRepoId         API 仓库标识
 * @property apiRepoName       API 仓库名称，对应于 api.json 中的 name 属性
 * @property groups            服务分组
 */
export interface RepoServiceList {
	apiRepoId: number;
	apiRepoName: string;
	groups: ServiceGroup[];
}

/**
 * @interface ServiceGroup
 *
 * Service 的分组信息，通常按资源分组，如将用户资源相关的所有 Service 放在一个组，并取名为 `users`
 *
 * @property name     分组名
 * @property paths    路径列表
 *
 */
export interface ServiceGroup {
	name: string;
	paths: PathItem[];
}

/**
 * @interface PathItem
 *
 * @property name           服务对应的请求路径，相对路径，必须以 `/` 开头，如 `/users/{userId}`
 * @property description    详细描述
 * @property operations     操作列表，一个 HttpMethod 对应一个操作
 */
export interface PathItem {
	name: string;
	description?: string;
	operations: Operation[];
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEAD" | "PATCH" | "TRACE";

/**
 * @interface Operation
 *
 * 操作，一个 HttpMethod 对应一个操作
 *
 * @property httpMethod     http method
 * @property operationId    操作标识，需要确保全局唯一，如 `getUserById`
 * @property description    详细描述
 * @property parameters     输入参数列表
 * @property requestBody    请求体，常用于 `POST` 和 `PUT`
 * @property responses      响应列表，不同的状态码对应不同的响应结果
 */
export interface Operation {
	httpMethod: HttpMethod;
	operationId: string;
	description?: string;
	parameters: Parameter[];
	requestBody?: RequestBody;
	responses: ApiResponse[];
}

export type ParameterLocation = "path" | "query" | "header" | "cookie";

/**
 * @interface Parameter
 *
 * 输入参数
 *
 * @property name              参数名
 * @property in                 参数的所在位置
 * @property description        详细描述
 * @property required           是否必填
 * @property allowEmptyValue    参数值是否允许为空
 * @property schema             输入参数的结构信息
 */
export interface Parameter {
	name: string;
	in: ParameterLocation;
	description?: string;
	required?: boolean;
	allowEmptyValue?: boolean;
	schema?: Schema;
}

/**
 * @interface RequestBody
 *
 * @property description    详细描述
 * @property content        请求体的内容列表
 */
export interface RequestBody {
	description?: string;
	content: MediaTypeContent[];
}

export type MediaType =
	| "application/json"
	| "application/octet-stream"
	| "application/x-www-form-urlencoded"
	| "text/plain"
	| "application/xml";

/**
 * @interface MediaTypeContent
 *
 * @property name      media type
 * @property schema    请求体的结构信息
 */
export interface MediaTypeContent {
	name: MediaType;
	// 只包含 schema，未考虑 openApi 中的 examples
	schema: Schema;
}

/**
 * @interface ApiResponse
 *
 * @property name           值为 `default` 或 http status code，如 `200`、`400` 等
 * @property description    详细描述
 * @property content        响应内容列表，为不同的 media type 设置各自的内容
 */
export interface ApiResponse {
	name: string; // default or http status code
	description?: string;
	content: MediaTypeContent[];
}

export type SchemaType = "string" | "number" | "boolean" | "object" | "array";

/**
 * @interface Schema
 *
 * @property type           数据类型
 * @property name           属性名
 * @property format         格式化
 * @property title          简述
 * @property description    详细描述
 * @property minimum        最小值
 * @property maximum        最大值
 * @property minLength      最小长度
 * @property maxLength      最大长度
 * @property pattern        正则表达式
 * @property required       是否必填
 * @property default        默认值
 * @property items          专用于 type 为 array，说明数组元素的结构
 * @property properties     属性列表
 */
export interface Schema {
	type: SchemaType;
	name?: string;
	format?: string;
	title?: string;
	description?: string;
	minimum?: number;
	maximum?: number;
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	required?: string[];
	default?: string;
	items?: Schema;
	properties?: Schema[];
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

interface PropertyGroupItem {
	propertyName?: string;
	target?: string[];
	divider?: Divider;
}

// FIXME: 关于 interface 名称的几点疑问：
// 1. PropertyLayout 中定义的并不是 Widget 所有属性的 Layout 信息，而是其中一个属性的定义，所以使用 layout 不太妥
// 2. propertyGroup 属性中存放的是不是也应该是 PropertyLayout 类型，这样就可以支持多层嵌套，但是具体还要看是否有这样的应用场景。
// 需进一步优化

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
	propertyGroup?: PropertyGroupItem[];
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
 * JavaScript 对象名与对象的对应关系
 */
export interface ExtensionJsObjectMap {
	[objectName: string]: object;
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
	onChangePaneLayout: (
		paneLayout: Partial<PaneLayout>,
		data: { propertyIndex: number; propertyValue?: string }
	) => void;
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
 * @interface RepoWidgetList
 *
 * 主要描述 API 部件仓库中的部件信息，一个 Repo 中存储的部件列表
 *
 * @property apiRepoId         API 仓库标识
 * @property apiRepoName       API 仓库名称，对应于 api.json 中的 name 属性
 * @property widgetCategories  分组的部件信息
 */
export interface RepoWidgetList {
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
 * git 仓库种类
 */
export type RepoCategory =
	| "Widget" // UI 部件
	| "Service" // RESTful API
	| "WebAPI"; // 客户端专用的函数

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
	category: RepoCategory;
	version: string;
	std: boolean;
}

// 用于定义项目依赖的函数库
export interface RepoFunctionList {
	apiRepoId: number;
	apiRepoName: string;
	jsObjects: JsObject[];
}

export interface JsObject {
	name: string;
	code: string;
	functions: MethodSignature[];
}

export interface MethodSignature {
	name: string;
	code: string;
	parameters: MethodParameter[];
	returnType: string;
}

export interface MethodParameter {
	name: string;
	type: string;
	optional: boolean;
	variable: boolean;
}

/**
 * 函数定义
 *
 * 因为 Function 算是关键字，所以在前面加上 Page。
 *
 * @property id                    函数标识
 * @property nodes                 节点列表，将一个完整的函数定义看作多个节点，第一个节点是函数签名信息，后续节点是函数体中调用的函数
 * @property sequenceConnections   序列连接线
 * @property dataConnections       数据连接线
 */
export interface PageFunction {
	id: string;
	nodes: VisualNode[];
	sequenceConnections: NodeConnection[];
	dataConnections: NodeConnection[];
}

/**
 * 序列端口
 *
 * 专用于描述函数的调用次序
 *
 * @property id      序列端口的标识
 */
interface SequencePort {
	id: string;
}

/**
 * 输入型序列端口
 */
export interface InputSequencePort extends SequencePort {}

/**
 * 输出型序列端口
 *
 * @property text  对端口的简短说明
 */
export interface OutputSequencePort extends SequencePort {
	text: string;
}

export type PortBindSource = "widgetEventArgument";
/**
 * 数据端口
 *
 * 专用于描述函数的输入参数和返回接口
 *
 * @property name           数据端口名，通常是输入参数名等
 * @property type           输入参数或返回结果的数据类型
 * @property bindSource     与哪一类数据绑定，如部件事件参数
 * @property bindId         绑定标识，取自定义标识，并不是实例标识
 */
export interface DataPort extends SequencePort {
	name: string;
	type: FunctionValueType;

	// 以下属性，在添加 API 组件时再设计
	bindSource?: PortBindSource;
	apiRepoId?: number;
	code?: string;
}

/**
 * 输入型的数据端口
 *
 * @property value        当 connected 的值为 false 时，通过输入框设置的值存在此处
 */
export interface InputDataPort extends DataPort {
	value?: string;
}

/**
 * 节点种类，这是按照节点的呈现形式分类的。
 */
export type NodeLayout =
	| "flowControl" // 流程控制节点
	| "data" // 数据节点
	| "async"; // 异步节点

export type NodeCategory =
	| "function" // 函数定义
	| "functionCall" // 函数调用
	| "variableSet" // 为变量设置值
	| "variableGet" // 获取变量的值
	| "service"; // 数据服务 RESTful API

// 注意，此处不应包含 "widgetEvent"，因为这属于函数与事件之间的绑定关系，并不是函数定义体中使用的数据
export type NodeBindSource =
	| "data" // 取自页面数据
	| "webApi" // 取自 web api
	| "service"; // 取自 RESTful API

/**
 * 可视化节点
 *
 * @property id                     函数节点标识
 * @property left                   函数节点左上角在设计器上的 x 坐标，原点是左上角
 * @property top                    函数节点左上角在设计器上的 y 坐标，原点是左上角
 * @property caption                标题，显示在 title 区域
 * @property text                   简述，显示在输入序列端口和输出序列端口之间
 * @property layout                 节点布局
 * @property category               函数定义或调用类型，目前主要用于动态设置节点的 caption 和 text 等属性
 * @property dataItemId             引用的数据项标识，当 category 为 variableGet 和 variableSet 时需设置此值
 * @property inputSequencePort      输入型的序列端口，一个节点只能有0或1个
 * @property outputSequencePorts    输出型的序列端口列表
 * @property inputDataPorts         输入型的数据端口列表
 * @property outputDataPorts        输出型的数据端口列表
 * @property bindSource             与哪一类数据绑定，如页面数据和 RESTful API 等
 * @property apiRepoId              API 仓库标识
 * @property funcInfo               web api 中定义的函数信息
 */
export interface VisualNode {
	id: string;
	left: number;
	top: number;
	caption: string;
	text: string;
	layout: NodeLayout;
	category: NodeCategory;
	dataItemId?: string;
	inputSequencePort?: InputSequencePort;
	outputSequencePorts: OutputSequencePort[];
	inputDataPorts: InputDataPort[];
	outputDataPorts: DataPort[];

	bindSource?: NodeBindSource;
	apiRepoId?: number;
	funcInfo?: FuncInfo;
}

export interface FuncInfo {
	objectCode: string;
	objectName: string;
	funcCode: string;
	funcName: string;
}

/**
 * 节点连接线
 *
 * 用于连接输出型与输入型的序列端口或数据端口。
 *
 * @property id           连接线标识
 * @property fromNode     起始节点标识
 * @property fromOutput   起始节点中的输出型端口标识
 * @property toNode       终止节点标识
 * @property toInput      终止节点中的输入型端口标识
 */
export interface NodeConnection {
	id: string;
	fromNode: string;
	fromOutput: string;
	toNode: string;
	toInput: string;
}

/**
 * 函数中参数值或返回值的数据类型
 */
export type FunctionValueType = PropertyValueType;

/**
 * @interface FunctionArgument
 *
 * 函数的输入参数
 *
 * @property id            参数定义标识 uuid
 * @property name          参数名
 * @property valueType     参数值的类型
 * @property defaultValue  参数的默认值
 */
export interface FunctionArgument {
	id: string; // -> number?
	name: string;
	valueType: FunctionValueType;
	defaultValue?: string;
}

export interface FunctionReturn {
	id: string;
	name: string;
	valueType: FunctionValueType;
}

/**
 * 事件处理函数
 *
 * 信息传递流：
 *
 * 1. 部件属性定义（定义了事件名，输入参数等函数签名信息） ->
 * 2. 生成一个函数定义标识（根据函数签名定义出的函数的标识）->
 * 3. 将上述两个信息存到 EventHandler 中（作为中转） ->
 * 4. 根据 EventHandler 生成在可视化函数设计器中的函数定义节点
 *
 * 专用于部件中的事件。因为事件处理函数不会有返回值，所以没有包含 return
 *
 * @property handlerId    事件处理函数的标识，注意不是事件定义的标识，是为事件绑定的处理函数的标识
 * @property eventName    事件名（事件定义的一部分）
 * @property eventInputArguments    事件的输入参数（事件定义的一部分）
 */
export interface EventHandler {
	handlerId: string;
	eventName: string;
	eventInputArguments: FunctionArgument[];
}

// export interface VariableDeclaration {
// 	dataId: string;

// }

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
	functions: PageFunction[];
}

export type PageDataItemValueType = "String" | "Number" | "Date" | "Boolean" | "Object" | "Array";

/**
 * 页面数据项。
 *
 * 页面数据是由多条有父子关系的数据项组成。
 *
 * @property id               页面数据标识
 * @property parentId         数据项的父标识
 * @property name             变量名
 * @property defaultValue     变量的默认值
 * @property value            在运行时为变量设置的值
 * @property type             变量值的类型
 * @property open             如果包含子数据项，是否展开，默认为不展开
 */
export interface PageDataItem {
	id: string;
	parentId: string;
	name: string;
	defaultValue?: string;
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
 * @type UIOperateTab
 *
 * UI 设计器操作面板中显示哪个 tab：
 *
 * 1. widgets: 显示部件列表的 tab
 * 2. properties: 显示属性列表的 tab
 */
export type UIOperateTab = "widgets" | "properties";

/**
 * @type BehaviorFunctionOperateTab
 *
 * Behavior 设计视图函数设计器中操作面板
 */
export type BehaviorFunctionOperateTab = "services" | "functions";

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
 *             operate-tab
 *                 widgets
 *                 properties
 *         behavior
 *             function
 *                 operate-tab
 *                     services
 *                     functions
 * ```
 *
 * @property editMode                      设计器的编辑模式
 * @property pageViewType                  页面视图类型，分为界面和行为
 * @property uiOperateTab                  ui 视图中的操作面板
 * @property behaviorFunctionOperateTab    behavior 视图中函数设计器中的操作面板
 */
export interface PaneLayout {
	editMode: EditMode;
	pageViewType: PageViewType;
	uiOperateTab: UIOperateTab;
	behaviorFunctionOperateTab: BehaviorFunctionOperateTab;
}

/**
 * @type State
 *
 * 设计器的共享状态
 *
 * @property project                       项目基本信息
 * @property projectDependencies           项目依赖的组件库信息，包括 Widget 的 IDE 版仓库和 Service 仓库
 * @property repoWidgets                   项目依赖的所有 widget，类型为 widget 的 API 库，按 API 库分组
 * @property repoServices                  项目依赖的所有 Service，类型为 Service 的 API 库
 * @property repoFunctions                 项目依赖的所有客户端函数，类型为 ClientAPI 的 API 库
 * @property pageModel                     页面模型
 * @property selectedWidgetIndex           当前选中的部件索引，是相对于全页面的索引
 * @property activeWidgetDimensions        当前选中部件的位置和大小信息等
 * @property selectedWidgetPropertyIndex   可选，当前选中的事件在属性列表中的索引，是相对于当前选中的部件，要跟 selectedWidgetIndex 结合使用
 * @property highlightWidgetIndex          高亮显示部件的索引，是相对于全页面的索引
 * @property highlightWidgetDimensions     高亮显示部件的位置和大小信息等
 * @property selectedDataItemIndex         当前选中的 data 元素的索引，是相对于全页面的索引
 * @property selectedFunctionId            当前选中函数的标识，一个页面会包含多个函数
 * @property selectedFunctionNodeId        当前选中的函数节点标识，一个函数由多个节点组成
 * @property dirty                         判断是否有未保存的内容，如果有则 dirty 的值为 true，否则 dirty 的值为 false，默认为 false
 * @property paneLayout                    定义设计器面板的布局
 */
export interface State {
	project: Project;
	projectDependencies: ComponentRepo[];
	repoWidgets: RepoWidgetList[];
	repoServices: RepoServiceList[];
	repoFunctions: RepoFunctionList[];
	pageModel: PageModel;
	// ui 的焦点信息
	selectedWidgetIndex: number;
	activeWidgetDimensions: DimensionResults;
	// behavior 面板中选中的部件事件的索引
	selectedWidgetPropertyIndex: number;
	// 页面中高亮显示部件的信息
	highlightWidgetIndex: number;
	highlightWidgetDimensions: DimensionResults;
	// behavior 的焦点信息
	// 1. data
	selectedDataItemIndex: number;
	// 2. function
	selectedFunctionId: string;
	// 3. function node
	// 函数编辑器中当前选中的节点标识
	selectedFunctionNodeId: string;
	// 数据操作状态：保存
	dirty: boolean;
	paneLayout: PaneLayout;
}
