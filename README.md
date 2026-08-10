# MoeKoe-Music-SearchTips-Stable
MoeKoe-Music-SearchTips，为MoeKoe Music软件添加搜索候选功能（稳定版）

## 📖 简介
一个为 MoeKoe Music 设计的搜索框实时建议插件。当您在搜索框中输入关键词时，插件会自动调用后端接口，展示相关搜索建议和热度，帮助您快速定位目标内容。

## ✨ 特性
- **实时建议**：输入即显示，智能匹配热门搜索词。
- **热度标识**：建议词附带热度指数，热门内容一目了然。
- **键盘导航**：支持方向键上下选择，回车确认，操作流畅。
- **点击即搜**：点击建议词即可自动填入搜索框并触发搜索。
- **固定数量**：当前版本稳定显示 **10 条** 建议，兼顾信息量与界面整洁。

## 🚀 使用方式
1. 安装插件后，在 MoeKoe Music 搜索框中输入关键词。
2. 建议列表将自动弹出，显示匹配的热门搜索词。
3. 使用 ↑/↓ 键高亮选择，按 Enter 键或直接点击建议词即可搜索。

## ⚙️ 技术说明
- 基于 Chrome Extension Manifest V3 开发。
- 采用纯前端 `fetch` 方式调用显示搜索建议接口。
- 目前为稳定过渡版本，建议数量固定为 10 条，后续可根据环境支持开放自定义。

## 📦 安装
~~直链下载加速地址：`https://fastly.jsdelivr.net/gh/1153683020/MoeKoe-Music-SearchTips-Stable/MoeKoe-Music-SearchTips.zip`~~

~~将插件文件夹放入 MoeKoe Music 的 `plugins/extensions` 目录，或在插件管理页通过“安装插件”选择 ZIP 包安装。~~

在插件市场找到本插件，直接点击安装即可

## 👤 作者
AZLight

## 📄 版本
1.0.0

## 📝 备注
由于宿主环境限制，配置实时同步功能暂未启用，因此目前固定为 10 条建议。若您需要调整数量，可联系作者或等待后续更新，也可自行更改。去找开发版本[点我](https://github.com/1153683020/MoeKoe-Music-SearchTips)

---

**Enjoy your searching!** 🔍

~~AI真是太好用了（~~
