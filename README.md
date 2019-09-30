# designer-core

[![npm version](https://badge.fury.io/js/designer-core.svg)](https://badge.fury.io/js/designer-core)

存放设计器的通用功能。

## `WidgetDesignable`

将用户自定义部件转换为可在设计器中使用的部件，即为部件扩展出用户交互功能：

1. 测量部件尺寸;
1. 增加遮盖层，屏蔽部件与设计器冲突的事件;
1. 覆盖部件的获取焦点效果;
1. 为空容器增加可视化效果等。

通过以下方式实现：

1. 根据部件内部的 `key` 定位到一个 `VNode`，然后在此 `VNode` 上绑定默认的 `onMouseUp` 事件；
2. ...

### 用户自定义部件

约定：

1. 每个部件都需要传入一个 key 属性；
