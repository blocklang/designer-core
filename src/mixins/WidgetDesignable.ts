import { DNode, Constructor } from "@dojo/framework/core/interfaces";
import { WidgetBase } from "@dojo/framework/core/WidgetBase";
import { afterRender } from "@dojo/framework/core/decorators/afterRender";
import { beforeProperties } from "@dojo/framework/core/decorators/beforeProperties";
import { EditableWidgetProperties } from "../interfaces";

interface WidgetDesignableMixin {
	properties: EditableWidgetProperties;
}

export function WidgetDesignableMixin<T extends new (...args: any[]) => WidgetBase>(
	Base: T
): T & Constructor<WidgetDesignableMixin> {
	abstract class WidgetDesignable extends Base {
		public abstract properties: EditableWidgetProperties;

		@beforeProperties()
		protected beforeProperties(properties: any) {
			console.log("widget designable beforeProperties");
			console.log("can has children:", this.canHasChildren(properties.widget.canHasChildren));
			return properties;
		}

		@afterRender()
		protected afterRender(result: DNode | DNode[]): DNode | DNode[] {
			console.log("widget designable afterRender");
			return result;
		}

		/**
		 * 是否可以包含子部件，能包含子部件则返回 true，不能包含子部件则返回 false。
		 *
		 * canHasChildren 已经在部件的基本信息中指定。
		 */
		private canHasChildren(defaultValue?: boolean): boolean {
			return defaultValue || false;
		}
	}
	return WidgetDesignable;
}

export default WidgetDesignableMixin;
