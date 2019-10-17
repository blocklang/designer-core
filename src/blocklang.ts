import global from "@dojo/framework/shim/global";
import { ExtensionWidgetMap, GitUrlSegment, PropertyLayout } from "./interfaces";
import { WidgetBaseInterface } from "@dojo/framework/core/interfaces";
import { WidgetData } from "@dojo/framework/core/vdom";

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
 * 获取部件类型
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
	global._block_lang_widgets_ = {};
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
	global._widget_instance_map = {};
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
	Object.values(global._widget_instance_map).forEach(
		(item: any) =>
			(item.set = function(key: any, value: any) {
				widgetInstanceMap.set(key, value);
				return this;
			})
	);
}
