import global from "@dojo/framework/shim/global";
import { ExtensionWidgetMap, GitUrlSegment } from "./interfaces";

/**
 * 注册第三方 UI 组件库中的 Widget
 *
 * @param gitUrlSegment     第三方组件库地址，解析后的格式为 {website}/{owner}/{repoName}，如：github.com/blocklang/ide-widgets-bootstrap
 * @param widgets           第三方组件库中定义 Widget 列表，其中包含 Widget 以及 Widget 对应的属性面板结构信息
 */
export function registerWidgets(gitUrlSegment: GitUrlSegment, widgets: ExtensionWidgetMap) {
	// 统一在 global._block_lang_widgets 中存放部件信息，是一个全局变量
	if (!global._block_lang_widgets_) {
		global._block_lang_widgets_ = {};
	}

	const repoUrl = getRepoUrl(gitUrlSegment);

	// 如果已经注册过，则以最后一次的为准，但要给出警告信息
	if (global._block_lang_widgets_[repoUrl]) {
		console.warn(`重复在 ${repoUrl} 下注册 Widget，会以最后一次注册为准！`);
	}

	global._block_lang_widgets_[repoUrl] = widgets;
}

export function findWidgetType(gitUrlSegment: GitUrlSegment | string, widgetName: string) {
	const repoUrl = typeof gitUrlSegment === "string" ? gitUrlSegment : getRepoUrl(gitUrlSegment);
	const widgetType =
		global._block_lang_widgets_ &&
		global._block_lang_widgets_[repoUrl] &&
		global._block_lang_widgets_[repoUrl][widgetName] &&
		global._block_lang_widgets_[repoUrl][widgetName].widget;
	return widgetType;
}

/**
 * 根据 gitUrlSegment 生成 git url
 *
 * @param gitUrlSegment
 */
export function getRepoUrl(gitUrlSegment: GitUrlSegment) {
	return `${gitUrlSegment.website}/${gitUrlSegment.owner}/${gitUrlSegment.repoName}`;
}
