# designer-core

[![npm version](https://badge.fury.io/js/designer-core.svg)](https://badge.fury.io/js/designer-core)

存放设计器的通用功能。

## `WidgetDesignable`

将用户自定义部件转换为可在设计器中使用的部件，即为部件扩展出用户交互功能：

1. 测量部件尺寸;
1. 增加遮盖层，屏蔽部件与设计器冲突的事件;
1. 覆盖部件的获取焦点效果;
1. 为空容器增加可视化效果等。
