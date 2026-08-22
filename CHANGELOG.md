# 更新记录 (Changelog)

## [未发布]

### 新增

- **播放页「自动连播遇到被屏蔽视频」处理**
  - 遇到被屏蔽视频时三种可选行为：**切换为未屏蔽视频** / **停止播放** / **不处理(默认)**，可通过插件配置面板的下拉框选择
  - 新增配置项 `flagSkipBlockedAutoplay`（`skip` / `stop` / `off`）
  - 新增模块 `src/autoplay/autoplay.js`
- **自动连播识别依据**：直接检测「当前正在播放的视频」并优先使用 `__INITIAL_STATE__.availableVideoList`（B 站连播依据的有序可播列表）与 `related`（带 UP 名/标题）取推荐顺序与 UP 主名，不再依赖 URL 变化（新版播放器为页面内原地切换）
- **连播屏蔽判定与卡片屏蔽规则一致**：`flagInfo`（UP 主名/标题）+ `flagTName`（分类标签）+ `flagVertical`（竖屏）；标签/竖屏一律用 `getBilibiliVideoApiData`（view 接口）取具体数据判定，不依赖 DOM 是否已渲染标签组
- **相关推荐全部被屏蔽时**：点击 B 站播放器「取消连播」按钮关闭自动连播，按钮不可见则暂停兜底
- **新版播放页结构适配**：UP 主名选择器补充 `.upname a span` / `.upname`；切集时通过捕获阶段监听 `<video>` 播放事件加速检测
- 新增被遮挡视频卡片的悬停延迟显示功能，支持开关和 0.1–5 秒自定义延迟

### 修复

- 支持将 `/index.html` 识别为 B 站首页
- 视频卡片缺少 `.card-box` / `.bili-video-card` 时不再抛 `Cannot read properties of undefined (reading 'appendChild')

## [重构版] - 2025-12-04

### 重构变更
- 将原单一文件脚本拆分为多个模块，提高代码可维护性
- 创建了以下模块：
  - `src/main.js`: 主入口文件
  - `src/storage/storage.js`: 存储管理模块
  - `src/core/core.js`: 核心屏蔽功能模块
  - `src/core/video-data.js`: 视频数据获取模块
  - `src/ui/ui.js`: 用户界面模块
  - `src/observer/observer.js`: 变动观察器模块
  - `src/pages/pages.js`: 页面检测和初始化模块
  - `src/ads/ads.js`: 广告屏蔽模块
  - `src/utils/utils.js`: 工具函数模块
- 添加构建脚本 `build.js`，自动合并所有模块到单个文件
- 添加 `package.json` 配置文件
- 添加 `README.md` 说明文档

### 重构优点
- 代码结构更清晰，便于维护和扩展
- 各功能模块职责明确，降低耦合性
- 自动化构建流程，确保发布版本一致性
- 保留了原脚本的所有功能和特性
