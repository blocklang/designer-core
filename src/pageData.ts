import { PageData } from "./interfaces";
import { findIndex } from "@dojo/framework/shim/array";

/**
 * 遵循 Json Path 规范 https://goessner.net/articles/JsonPath/
 *
 * @param pageData   页面数据列表
 * @param dataId     数据项标识
 */
export function convertDataIdToJsonPath(pageData: PageData[], dataId: string): string {
	if (dataId.trim() === "") {
		return "";
	}

	const currentDataIndex = findIndex(pageData, (item) => item.id === dataId);
	if (currentDataIndex === -1) {
		return "";
	}

	// 依次获取当前节点的所有父节点，以生成表达式。
	const currentDataItem = pageData[currentDataIndex];
	const currentDataId = currentDataItem.id;
	let parentId = currentDataItem.parentId;
	const dataPath: PageData[] = pageData
		.slice(0, currentDataIndex + 1)
		.reduceRight((previousValue: PageData[], currentValue: PageData) => {
			if (currentValue.id === currentDataId) {
				previousValue.push(currentValue);
			} else if (currentValue.id === parentId) {
				previousValue.push(currentValue);
				parentId = currentValue.parentId;
			}
			return previousValue;
		}, []);

	dataPath.reverse();

	let jsonPath = "";
	dataPath.forEach((item, index, array) => {
		if (index === 0) {
			jsonPath += item.name;
		} else {
			// 存在这样的情况，前一步获取到的数组为 [obj,array,str], 其中 array 是数组，
			// 当遍历到 str 时，不能直接将表达式拼接成 obj.array.str
			// 需要计算出 str 在 array 中的索引，如 1, 则将表达式拼接成 obj.array[1]
			if (array[index - 1].type === "Array") {
				const preIndex = findIndex(pageData, (ele) => {
					return ele.id === dataPath[index - 1].id;
				});
				const currentIndex = findIndex(pageData, (ele) => {
					return ele.id === dataPath[index].id;
				});
				jsonPath += "[" + (currentIndex - preIndex - 1) + "]";
			} else {
				jsonPath += "." + item.name;
			}
		}
	});
	return jsonPath;
}
