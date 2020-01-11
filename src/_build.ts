// 因为 cli-build-widget 存在此问题 https://github.com/dojo/cli-build-widget/issues/87
// 所以在此处添加没能 build 的文件。等此 bug 修复后，删除此文件以及在 .dojorc 中配置的 "src/_build.ts"
import "src/testing/mocks/middleware/ide.ts";
