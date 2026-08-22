# Bilibili-BlackList

> Bilibili UP 主视频屏蔽插件 —— 支持精确匹配 / 正则匹配，屏蔽主页 / 播放页 / 搜索页 / 分类页 / 用户空间中的指定内容。  
> 代码主要由 AI 辅助生成，持续优化中。

---

## 📌 插件简介

**Bilibili-BlackList** 是一款油猴（Tampermonkey）用户脚本，支持自定义屏蔽 B 站上的不感兴趣 UP 主和视频内容，提升个人使用体验。  
支持**全站主要页面**，并提供**图形化黑名单管理界面**，无需修改代码即可编辑黑名单。

### 特色功能

- ✅ **视频卡片屏蔽**，支持 主页 / 播放页 / 分类页 / 搜索页。
- ✅ **用户空间支持**，直接屏蔽当前访问的 UP 主。
- ✅ **屏蔽策略**：
  - **精确匹配黑名单**（UP 主名称匹配）。
  - **正则匹配黑名单**（UP 主 / 视频标题匹配）。
- ✅ **黑名单管理面板**，支持一键添加 / 移除黑名单项，切换“取消屏蔽 / 恢复屏蔽”。
- ✅ **已屏蔽视频计数展示**，方便查看效果。
- ✅ **广告屏蔽**，屏蔽部分推广卡片。
- ✅ **自动适配动态内容加载**，无需手动刷新。
- ✅ 被遮挡的视频卡片支持悬停延迟显示，可开关并自定义 0.1–5 秒延迟，移开鼠标后自动恢复遮挡。
- ✅ 播放页自动连播遇到被屏蔽视频时，可选择「切换为未屏蔽视频」/「停止播放」/「不处理(默认)」，在插件配置面板中设置。

---

## 🚀 安装方式

### 1️⃣ 安装 Tampermonkey

👉 [https://tampermonkey.net/](https://tampermonkey.net/)

### 2️⃣ 安装脚本

👉 [GreasyFork 脚本地址](https://update.greasyfork.org/scripts/533940/Bilibili-BlackList.user.js)  
👉 或直接在 [GitHub Releases](https://github.com/HeavenTTT/bilibili-blacklist/releases) 下载 `.user.js` 脚本手动安装。

### 3️⃣ 打开 Bilibili 网站，右上角将出现插件入口，开始使用。

---

## 📦 项目重构说明

本项目已重构为模块化结构，包含以下文件：

- `src/storage/storage.js` - 存储管理模块
- `src/core/core.js` - 核心屏蔽功能模块
- `src/core/video-data.js` - 视频数据获取模块
- `src/ui/ui.js` - 用户界面模块
- `src/observer/observer.js` - 变动观察器模块
- `src/pages/pages.js` - 页面检测和初始化模块
- `src/ads/ads.js` - 广告屏蔽模块
- `src/utils/utils.js` - 工具函数模块
- `src/main.js` - 主入口文件

### 构建方法（发布用）

1. 安装 Node.js
2. 在项目根目录运行以下命令生成最终脚本：

```bash
npm run build
```

或者直接运行构建脚本：

```bash
node build.js
```

构建后的脚本位于 `dist/bilibili-blacklist.user.js`

### 开发工作流（推荐）

一条命令即可完成「构建 + 监听 + 本地服务器」，改完代码**刷新页面**立即生效，无需再改 `?t=` 参数、也无需重新安装脚本。

#### 涉及文件

| 文件 | 作用 |
| ---- | ---- |
| `scripts/dev.js` | 一键开发脚本：首次构建 → 监听 `src/` 变化自动重建 → 本地静态服务器（no-cache + CORS），零依赖 |
| `test/bilibili-blacklist.dev.user.js` | 油猴加载器，**只需安装一次**，之后永远不用修改 |
| `test/s.bat` | Windows 下双击即可启动开发环境 |

#### 1️⃣ 一次性安装加载器

- 打开 `test/bilibili-blacklist.dev.user.js`，按油猴提示安装；
- 或先启动服务器后，在浏览器访问 `http://localhost:5173/test/bilibili-blacklist.dev.user.js` 安装。

安装后请**禁用旧的 "Bilibili-BlackList -Dev" 脚本**，避免重复运行。

#### 2️⃣ 启动开发环境（三选一）

```bash
npm run dev
```

```bash
node scripts/dev.js
```

或双击 `test\s.bat`（Windows）。

启动后会自动完成：
1. 构建产物到 `dist/bilibili-blacklist.user.js`；
2. 监听 `src/` 目录，代码变更后自动重新构建（防抖 150ms）；
3. 在 `http://localhost:5173` 启动静态服务器（`no-cache` + CORS）。

#### 3️⃣ 开始开发

修改 `src/` 下的代码并保存 → 控制台提示"构建完成" → **刷新 B 站页面**即可看到最新效果。

#### 工作原理

油猴对 `@require` 是按 URL 缓存资源的，旧方式每次都要改 `?t=` 强制重新下载。
新方式改为**加载器**：加载器脚本本身从不变化，每次打开页面时通过 `GM_xmlhttpRequest` 实时拉取 `localhost:5173/dist/bilibili-blacklist.user.js?t=<时间戳>` 并执行，因此只需安装一次；本地服务器返回 `no-cache` 头 + 加载器带时间戳查询参数，双重保险。

#### 常见问题排查

- **控制台报"无法连接本地 dev server"**：dev server 未启动或端口被占用，请先运行 `npm run dev`。
- **控制台报"拉取构建产物失败，HTTP 404"**：确认 dev server 工作目录为项目根目录（存在 `dist/`）。
- **改代码后刷新页面没有变化**：确认终端已出现"构建完成"提示；没有则说明 `src/` 未被监听（请确认在项目根目录启动）。
- **页面出现两个盾牌图标 / 功能双份执行**：旧的 "Bilibili-BlackList -Dev" 脚本未禁用。
- **首次安装后控制台有跨域请求提示**：油猴弹出允许请求 `localhost` 的确认时选择「始终允许」即可（加载器已声明 `@connect localhost` / `127.0.0.1`）。

---

## 🖼 使用截图

（可在这里插入使用截图，示意管理面板、屏蔽效果等）

---

## 📒 使用说明

### 页面支持

| 页面类型 | 是否支持 |
| -------- | -------- |
| B 站主页 | ✅ |
| 播放页 `/video/` | ✅ |
| 分类页 `/c/` | ✅ |
| 搜索页 `search.bilibili.com` | ✅ |
| 用户空间页 `space.bilibili.com` | ✅ |

### 黑名单管理

- 右上角盾牌图标 → 打开管理面板。
- 添加 / 移除 **精确匹配** UP 主。
- 添加 / 移除 **正则匹配**规则，匹配 UP 主 / 视频标题。
- 切换 **取消屏蔽 / 恢复屏蔽**，查看当前屏蔽数量。

### 用户空间增强

- 用户空间页昵称旁直接增加 "屏蔽" 按钮。
- 已屏蔽状态下昵称加删除线，全站页面灰度提示。

### 广告屏蔽

- 部分主页推广、直播推广。
- 播放页推广 / 游戏推广等广告元素。

---

## 📋 更新记录

详见 [CHANGELOG.md](./CHANGELOG.md)

---

## ⚠️ 注意事项

- 代码主要由 AI 工具（ChatGPT / Gemini / DeepSeek）辅助生成，作者不保证稳定性，欢迎反馈问题。
- 如有 B 站页面结构调整，可能需要更新脚本适配。
- 脚本完全本地运行，不上传任何用户数据，黑名单保存在浏览器中。

---

## 📜 开源许可

MIT License.

---

## 🤝 致谢

感谢以下工具 / 项目：

- ChatGPT / Gemini / DeepSeek AI 辅助代码生成
- Tampermonkey 油猴脚本平台
- Bilibili 官方页面结构

---

**Enjoy a clean and personalized Bilibili! 🚀**

