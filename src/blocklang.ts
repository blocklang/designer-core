import global from "@dojo/framework/shim/global";
import { ExtensionWidgetMap, GitUrlSegment } from "./interfaces";

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

	// 如果已经注册过，则以最后一次的为准，但要给出警告信息
	if (global._block_lang_widgets_[repoUrl]) {
		throw `重复在 ${repoUrl} 下注册 Widget，会以最后一次注册为准！`;
	}

	global._block_lang_widgets_[repoUrl] = widgets;
}

/**
 * 获取部件类型
 *
 * @param gitUrlSegment    部件托管的 git 仓库地址信息
 * @param widgetName       部件名称，在一个 git 仓库中必须确保唯一
 *
 * @returns                返回的是继承 WidgetBase 的类型
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
 * @returns                返回属性面板的布局信息，是一个数组
 */
export function findWidgetPropertiesLayout(gitUrlSegment: GitUrlSegment | string, widgetName: string): Array<any> {
	const repoUrl = typeof gitUrlSegment === "string" ? gitUrlSegment : getRepoUrl(gitUrlSegment);
	return (
		global._block_lang_widgets_ &&
		global._block_lang_widgets_[repoUrl] &&
		global._block_lang_widgets_[repoUrl][widgetName] &&
		global._block_lang_widgets_[repoUrl][widgetName].propertiesLayout
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
