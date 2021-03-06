# designer-core

[![npm version](https://badge.fury.io/js/designer-core.svg)](https://badge.fury.io/js/designer-core)

存放设计器的通用功能。

## 安装依赖

```bash
npm install designer-core
```

## 基于类的部件

`WidgetDesignable` 是 Widget 的 Mixin，将用户自定义部件扩展为可在设计器中使用的部件，即为部件添加以下交互功能：

1. 测量聚焦部件的尺寸，以便为部件添加聚焦框;
2. 测量光标指向部件的尺寸，以便为部件添加高亮框；
3. 增加遮盖层，屏蔽部件默认的聚焦效果以及与设计器冲突的事件;
4. 为空容器增加可视化效果等；
5. 支持在部件中修改指定属性的值。

注意：`WidgetDesignable` 只适用于基于类的部件，不能与基于函数的部件一起使用。

通过以下方式实现：

1. 根据部件内部的 `key` 定位到一个 `VNode`，然后在此 `VNode` 上绑定默认的 `onMouseUp` 事件；
2. ...

### 自定义部件

约定：

1. 每个部件的根节点都需要设置 `key` 属性，将设置 `key` 的代码提取到 `getRootKey(): string` 方法中；

### 如何开发设计器版部件

设计器版部件是基于上面定义的自定义部件扩展的。

1. 创建基于类的设计器部件；
1. 导入 `WidgetDesignableMixin`

   ```ts
   import { WidgetDesignableMixin } from "designer-core/mixins/WidgetDesignable";
   ```

1. 设计器部件继承自混入了 `WidgetDesignableMixin` 的自定义部件

   ```ts
   // 因为要将设计器版部件也取名为 Page，所以将用户自定义部件重命名为 PageBase
   // 即约定加上 Base 后缀
   import PageBase from "std-widget-web/page";
   export default class Page extends WidgetDesignableMixin(PageBase) {}
   ```

1. 为部件添加遮盖层。在设计器版部件中覆写 `needOverlay` 方法（默认返回 `false`），输入框之类的部件需要在设计器中屏蔽点击事件等。

   ```ts
   protected needOverlay(): boolean {
       return false;
   }
   ```

2. 支持在部件中直接编辑指定的属性，在此方法中指定可直接编辑的属性名。通常需要覆写 web 版部件，让其支持编辑功能。

   ```ts
   protected getCanEditingPropertyName(): string | undefined {
       return;
   }
   ```

### 示例

1. 自定义部件

   > page/index.tsx

   ```tsx
   import { tsx } from '@dojo/framework/core/vdom';
   import WidgetBase from '@dojo/framework/core/WidgetBase';
   import * as css from './index.m.css';

   export interface PageProperties {
   }

   export default class Page extends WidgetBase<PageProperties> {
       protected render() {
           return (
               <div key="page" classes={[css.root]}>{this.children}</div>
           );
       }
   }
   ```

2. 设计器版部件

   > page/index.ts

   ```ts
   import PageBase from "std-widget-web/page";
   // 注意：WidgetDesignableMixin 一定要用大括号括住
   import { WidgetDesignableMixin } from "designer-core/mixins/WidgetDesignable";

   export default class Page extends WidgetDesignableMixin(PageBase) {

   }
   ```

## 基于函数的部件

`ide` 中间件专用于为基于函数的部件添加在设计器中交互功能。在部件中添加 `ide` 中间件即可。

```ts
import ide from 'designer-core/middleware/ide';

const factory = create({ ide }).properties<PageDataProperties>();

export default factory(function PageDataIde({ properties, middleware: { ide } }){

});
```

## 设计器插件

设计器插件是一种集成方式，用于将第三方的 Widget 或功能组件集成到页面设计器中。要在入口文件（通常是 `main.ts`）的**最后**调用 `blocklang.registerWidgets` 函数来注册部件。设计器插件要发布为 Webpack Library，然后通过动态添加 `script` 节点来加载插件，当插件加载完成后，会执行 `blocklang.registerWidgets` 函数。

定义 `TextInput` 部件

> text-input/index.ts

```ts
export default class TextInput extends WidgetBase {}
```

定义 `TextInput` 的属性面板

> text-input/propertiesLayout.ts

```ts
export default {

};
```

在 `main.ts` 文件中调用 `blocklang.registerWidgets()` 函数注册 Widget

注意：在注册部件时，部件的 key 值必须与 API 仓库中定义的部件名相同，具体是指新建部件时指定的 `name` 属性，即 changelog 文件中 `newWidget` 操作中的 `name` 属性。因为在设计器中会根据这个 `name` 属性查找 IDE 版部件类。如以下代码中的 key 值为 `TextInput`。

> main.ts

```ts
import * as blocklang from './blocklang';
import {TextInputBase} from './text-input'; // 通常位于非设计器版的仓库中，此处
import TextInput from './text-input';
import TextInputPropertiesLayout from './text-input/propertiesLayout';
import { GitUrlSegment, ExtensionWidgetMap } from '../../src/interfaces';

import { widgetInstanceMap } from "@dojo/framework/core/vdom";

const gitUrlSegment: GitUrlSegment = {website: "github.com", owner: "blocklang", repoName: "repo"};
const widgets: ExtensionWidgetMap = {
    // key 必须与 API 仓库中定义的部件名相同，即必须与 newWidget 操作中的 name 属性保持一致
    "TextInput": {widget: TextInputBase, ideWidget: TextInput, propertiesLayout: TextInputPropertiesLayout}
};

blocklang.registerWidgets(gitUrlSegment, widgets);

// 注意，当前只支持基于类的部件
// 当使用基于类的部件，需要调用此函数缓存第三方库中的 widgetInstanceMap 对象
// 如果是标准库，则不需要填写这段代码，因为标准库是直接 import 的
blocklang.cacheWidgetInstanceMap(gitUrlSegment, widgetInstanceMap);
```

从注册的 Widget 列表中获取其中一个 Widget：

```ts
import * as blocklang from './blocklang';
import { GitUrlSegment } from '../../src/interfaces';

const gitUrlSegment: GitUrlSegment = {website: "github.com", owner: "blocklang", repoName: "repo"};

// 注意，widgetName 必须与注册部件时为部件指定的 key 值相同
const widgetName = "TextInput";
// 根据仓库的地址信息获取
const widgetType = blocklang.findWidgetType(gitUrlSegment, widgetName);

// 直接根据仓库的 url 获取
const gitRepoUrl = blocklang.getRepoUrl(gitUrlSegment);
// 预览时使用
const widgetType = blocklang.findWidgetType(gitRepoUrl, widgetName);

// 设计时使用
const widgetType = blocklang.findIdeWidgetType(gitRepoUrl, widgetName);
```

在页面设计器中监听并同步第三方库中 widgetInstanceMap 的变化

```ts
import { widgetInstanceMap } from "@dojo/framework/core/vdom";

blocklang.watchingWidgetInstanceMap(widgetInstanceMap);
```

## 注册中间件

以下内容专用于基于函数的部件。

第三方组件库中直接引用 `@dojo/framework` 中的 `node` 和 `dimensions` 等中间件会无法获得 node 节点，因为第三方库中的 widget 都注册到 page-designer 项目中的 `widgetMetaMap` 对象中，而在第三方组件库中直接引用 `@dojo/framework` 中的 `node` 和 `dimensions` 等中间件时是从第三方库中的 `widgetMetaMap` 对象中查找部件，当然找不到了。所以此处需要将 page-designer 中的 `dimensions` 缓存到 `global` 对象中，然后在第三方库中使用此 `dimensions` 就可查找到部件。

在 page-designer 的顶层部件中调用 `blocklang.registerDimensionsMiddleware(dimensions: any)` 函数来注册 `dimensions`：

```ts
import dimensions from "@dojo/framework/core/middleware/dimensions";
import * as blocklang from "designer-core/blocklang";

blocklang.registerDimensionsMiddleware(dimensions);
```

在 designer-core 项目中的 `ide` 中间件中调用 `blocklang.getDimensionsMiddleware()` 函数来获取缓存的 `dimensions`。
