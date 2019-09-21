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
			return properties;
		}

		@afterRender()
		protected afterRender(result: DNode | DNode[]): DNode | DNode[] {
			console.log("widget designable afterRender");
			return result;
		}
	}
	return WidgetDesignable;
}

export default WidgetDesignableMixin;
