# designer-core

[![npm version](https://badge.fury.io/js/designer-core.svg)](https://badge.fury.io/js/designer-core)

存放设计器的通用功能。

## 安装依赖

```bash
npm install designer-core
```

## `WidgetDesignable`

`WidgetDesignable` 是 Widget 的 Mixin，将用户自定义部件扩展为可在设计器中使用的部件，即为部件添加以下交互功能：

1. 测量聚焦部件的尺寸，以便为部件添加聚焦框;
2. 测量光标指向部件的尺寸，以便为部件添加高亮框；
3. 增加遮盖层，屏蔽部件默认的聚焦效果以及与设计器冲突的事件;
4. 为空容器增加可视化效果等。

注意：`WidgetDesignable` 只适用于基于类的部件，不能与基于函数的部件一起使用。

通过以下方式实现：

1. 根据部件内部的 `key` 定位到一个 `VNode`，然后在此 `VNode` 上绑定默认的 `onMouseUp` 事件；
2. ...

### 自定义部件

约定：

1. 每个部件的根节点都需要设置 `key` 属性；

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
   import { WidgetDesignableMixin } from "designer-core/mixins/WidgetDesignable";

   export default class Page extends WidgetDesignableMixin(PageBase) {

   }
   ```
