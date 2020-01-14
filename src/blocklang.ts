import global from "@dojo/framework/shim/global";
import { ExtensionWidgetMap, GitUrlSegment, PropertyLayout } from "./interfaces";
import { WidgetBaseInterface } from "@dojo/framework/core/interfaces";
import { WidgetData } from "@dojo/framework/core/vdom";
import dimensions from "@dojo/framework/core/middleware/dimensions";

/**
 * 注册第三方 UI 组件库中的 Widget
 *
 * @param gitUrlSegment     第三方组件库地址，解析后的格式为 {website}/{owner}/{repoName}，如：github.com/blocklang/ide-widgets-bootstrap
 * @param widgets           第三方组件库中定义 Widget 列表，其中包含 Widget 以及 Widget 对应的属性面板结构信息
 */
export function registerWidgets(gitUrlSegment: GitUrlSegment, widgets: ExtensionWidgetMap): void {
	// 统一在 global._block_lang_widgets 中存放部件信息，是一个全局变量
	if (!global._block_lang_widgets_) {
		global._block_lang_widgets_ = {};
	}

	const repoUrl = getRepoUrl(gitUrlSegment);
	if (global._block_lang_widgets_[repoUrl]) {
		throw `已注册过 ${repoUrl} 下的部件，不能重复注册！`;
	}

	global._block_lang_widgets_[repoUrl] = widgets;
}

/**
 * 获取部件类型，预览页面时使用
 *
 * @param gitUrlSegment    部件托管的 git 仓库地址信息
 * @param widgetName       部件名称，在一个 git 仓库中必须确保唯一
 *
 * @returns                返回的是继承 WidgetBase 的类型；如果没有找到，则返回 undefined
 */
export function findWidgetType(gitUrlSegment: GitUrlSegment | string, widgetName: string): any {
	const repoUrl = typeof gitUrlSegment === "string" ? gitUrlSegment : getRepoUrl(gitUrlSegment);
	return (
		global._block_lang_widgets_ &&
		global._block_lang_widgets_[repoUrl] &&
		global._block_lang_widgets_[repoUrl][widgetName] &&
		global._block_lang_widgets_[repoUrl][widgetName].widget
	);
}

/**
 * 获取部件类型，设计页面时使用
 *
 * @param gitUrlSegment    部件托管的 git 仓库地址信息
 * @param widgetName       部件名称，在一个 git 仓库中必须确保唯一
 *
 * @returns                返回的是继承 WidgetBase 的类型；如果没有找到，则返回 undefined
 */
export function findIdeWidgetType(gitUrlSegment: GitUrlSegment | string, widgetName: string): any {
	const repoUrl = typeof gitUrlSegment === "string" ? gitUrlSegment : getRepoUrl(gitUrlSegment);
	return (
		global._block_lang_widgets_ &&
		global._block_lang_widgets_[repoUrl] &&
		global._block_lang_widgets_[repoUrl][widgetName] &&
		global._block_lang_widgets_[repoUrl][widgetName].ideWidget
	);
}

/**
 * 获取部件的属性面板布局信息
 *
 * @param gitUrlSegment    部件托管的 git 仓库地址信息
 * @param widgetName       部件名称，在一个 git 仓库中必须确保唯一
 *
 * @returns                返回属性面板的布局信息，是一个数组，如果没有找到，则返回空数组
 */
export function findWidgetPropertiesLayout(
	gitUrlSegment: GitUrlSegment | string,
	widgetName: string
): Array<PropertyLayout> {
	const repoUrl = typeof gitUrlSegment === "string" ? gitUrlSegment : getRepoUrl(gitUrlSegment);
	return (
		(global._block_lang_widgets_ &&
			global._block_lang_widgets_[repoUrl] &&
			global._block_lang_widgets_[repoUrl][widgetName] &&
			global._block_lang_widgets_[repoUrl][widgetName].propertiesLayout) ||
		[]
	);
}

/**
 * 根据 gitUrlSegment 生成 git url
 *
 * @param gitUrlSegment
 */
export function getRepoUrl(gitUrlSegment: GitUrlSegment): string {
	return `${gitUrlSegment.website}/${gitUrlSegment.owner}/${gitUrlSegment.repoName}`;
}

/**
 * 清空所有扩展组件
 */
export function clearExtensionComponents(): void {
	delete global._block_lang_widgets_;
}

/**
 * 缓存第三方中 dojo 的 widgetInstanceMap 对象，因为基于类的部件会存在这个对象中，而这个对象只能在 library 内使用。
 *
 * 在组件库中调用。
 *
 * @param gitUrlSegment          部件托管的 git 仓库地址信息
 * @param widgetInstanceMap      位于第三方库中，@dojo/framework/core/vdom 中的 widgetInstanceMap 对象
 */
export function cacheWidgetInstanceMap(
	gitUrlSegment: GitUrlSegment,
	widgetInstanceMap: WeakMap<WidgetBaseInterface, WidgetData>
) {
	if (!global._widget_instance_map) {
		global._widget_instance_map = {};
	}

	const repoUrl = getRepoUrl(gitUrlSegment);
	if (global._widget_instance_map[repoUrl]) {
		throw `已注册过 ${repoUrl} 下的 widgetInstanceMap 对象，不能重复注册！`;
	}

	global._widget_instance_map[repoUrl] = widgetInstanceMap;
}

/**
 * 清空缓存的 widgetInstanceMap
 */
export function clearWidgetInstanceMap(): void {
	delete global._widget_instance_map;
}

/**
 * 监听第三方库中 widgetInstanceMap 的变化，并同步到 Page Designer 的 widgetInstanceMap 中。
 *
 * TODO: 跟 dojo 开发团队协商调整 @dojo/framework/core/vdom 实现，不再使用 export widgetInstanceMap 的写法
 *
 * 在 Page Designer 中调用
 *
 * @param widgetInstanceMap    位于 Page Designer 中，@dojo/framework/core/vdom 中的 widgetInstanceMap 对象
 */
export function watchingWidgetInstanceMap(widgetInstanceMap: WeakMap<WidgetBaseInterface, WidgetData>) {
	if (!global._widget_instance_map) {
		return;
	}
	Object.values(global._widget_instance_map).forEach((item: any) => {
		// 为什么这样会起作用？
		// 为什么不是 originSet 和 set 引用的不是同一个方法
		item.originSet = item.set;
		item.set = function(key: any, value: any) {
			widgetInstanceMap.set(key, value);
			this.originSet(key, value);
			return this;
		};
	});
}

/**
 * 将 page-designer 中的中间件注册到此处，供第三方的 ide 版的组件库使用
 *
 * 	因为基于函数的部件，将所有的部件都存在 page-designer 项目中的 widgetMetaMap 实例中了，
 * 	而调用 node 中间件时依然从 ide-widget-bootstrap 等第三方项目的 widgetMetaMap 中查找部件，
 * 	所以就永远返回 null，因此考虑将 page-designer 中的中间件传过来，直接使用 page-designer
 * 	项目中的中间件，不使用 ide-widget-bootstrap 等第三方项目中的中间件。
 *
 * @param dimensions 在 page-designer 项目中 import 的 dimensions
 */
export function registerDimensionsMiddleware(dimensions: any) {
	if (!global._middlewares_) {
		global._middlewares_ = {};
	}

	global._middlewares_._dimensions_ = dimensions;
}

/**
 * 返回 dimensions 中间件。
 *
 * 此方法主要用于插件开发，通过使用 registerDimensionsMiddleware 注册的 middleware，可以让第三方插件使用主程序中的 dimensions 插件。
 *
 * 注意：之所以需要返回默认的 dimesions，是因为如果 ide 中间件不用于插件开发时，没有办法获取到 dimensions 中间件。
 *
 * @returns 如果注册了 dimensions，就返回注册的 dimensions 中间件；否则返回直接 import 的 dimensions 中间件。
 */
export function getDimensionsMiddleware(): any {
	if (!global._middlewares_) {
		console.warn("因为没有使用 registerDimensionsMiddleware 函数注册 dimensions，所以使用默认的 dimensions。");
		return dimensions;
	}
	const dimensionsMiddleware = global._middlewares_._dimensions_;
	if (!dimensionsMiddleware) {
		console.warn("因为没有使用 registerDimensionsMiddleware 函数注册 dimensions，所以使用默认的 dimensions。");
		return dimensions;
	}
	return dimensionsMiddleware;
}

export function clearMiddlewares() {
	delete global._middlewares_;
}
