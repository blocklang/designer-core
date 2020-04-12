import { PageDataItem } from "../interfaces";
import { findIndex, find } from "@dojo/framework/shim/array";
import { getNodePath } from "./treeUtil";

/**
 * 将 dataItemId 转换为 json path，两者指向同一个数据。
 *
 * 遵循 Json Path 规范 https://goessner.net/articles/JsonPath/
 *
 * @param pageData       页面数据列表
 * @param dataItemId     数据项标识
 */
export function convertDataIdToJsonPath(pageData: PageDataItem[], dataItemId: string): string {
	if (dataItemId.trim() === "") {
		return "";
	}

	const currentDataIndex = findIndex(pageData, (item) => item.id === dataItemId);
	if (currentDataIndex === -1) {
		return "";
	}

	// 依次获取当前节点的所有父节点，以生成表达式。
	const dataPath = getNodePath(pageData, currentDataIndex);

	let jsonPath = "";
	dataPath.forEach((item, index, array) => {
		if (index === 0) {
			jsonPath += item.node.name;
		} else {
			// 存在这样的情况，前一步获取到的数组为 [obj,array,str], 其中 array 是数组，
			// 当遍历到 str 时，不能直接将表达式拼接成 obj.array.str
			// 需要计算出 str 在 array 中的索引，如 1, 则将表达式拼接成 obj.array[1]
			if (array[index - 1].node.type === "Array") {
				jsonPath += `[${item.index}]`;
			} else {
				jsonPath += `.${item.node.name}`;
			}
		}
	});
	return jsonPath;
}

/**
 * 获取 dataItemId 对应的数据，根据 type 返回不同的数据类型。
 *
 * @param pageData       页面数据列表
 * @param dataItemId     数据项标识
 * @returns              如果 dataItemId 为空字符串，或者在 pageData 中不存在指定的 dataItemId，则返回 undefined；否则返回对应的值
 */
export function getValue(pageData: PageDataItem[], dataItemId: string): any {
	if (dataItemId.trim() === "") {
		return;
	}
	const currentDataItem = find(pageData, (item) => item.id === dataItemId);
	if (!currentDataItem) {
		return;
	}

	function _getObjectValue(dataItem: PageDataItem) {
		const result: any = {};
		pageData
			.filter((item) => item.parentId === dataItem.id)
			.forEach((item) => {
				result[item.name] = _getValue(item);
			});
		return result;
	}

	function _getArrayValue(dataItem: PageDataItem) {
		const result: any[] = [];
		pageData
			.filter((item) => item.parentId === dataItem.id)
			.forEach((item) => {
				result.push(_getValue(item));
			});
		return result;
	}

	function _getValue(dataItem: PageDataItem) {
		if (dataItem.type === "Number") {
			return Number(dataItem.value || dataItem.defaultValue);
		} else if (dataItem.type === "Boolean") {
			return Boolean(dataItem.value || dataItem.defaultValue);
		} else if (dataItem.type === "Object") {
			return _getObjectValue(dataItem);
		} else if (dataItem.type === "Array") {
			return _getArrayValue(dataItem);
		}
		return dataItem.value || dataItem.defaultValue;
	}

	return _getValue(currentDataItem);
}
