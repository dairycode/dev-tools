# dev-tools 开发约定

- 使用中文沟通。UI 和功能只能优化，不能以重构为理由接受回归。
- Node.js 24.15+（建议 24 LTS），使用 npm 和已提交的 package-lock.json；安装用 `npm ci`。
- 开发：`npm run dev`。提交前：`npm run verify`、`npm run test:e2e`。Docker：`docker compose up -d --build`。
- `src/app/registry.ts` 是工具导航、标题和入口的唯一清单：六个工具全部同步加载，切换不显示加载占位，也不额外请求工具脚本。
- 下拉框统一用 `src/shared/ui/Select.tsx` 页面自绘组件，不用系统原生 select；保留明暗主题、键盘和触屏操作。
- 界面只保留必要标签、操作与有效错误提示，不加重复介绍、标语、隐私徽章或常驻快捷键小字；快捷键功能继续保留。
- 页面装饰图标统一在 `src/shared/ui/Icon.tsx` 维护：24×24 画布、2px 圆角描边、currentColor；不使用 emoji 或各处复制 SVG。
- 页面及内部滚动区禁用边界回弹；常见桌面窗口下六工具初始内容尽量一屏展示。长输入/结果、窄屏和放大后仍允许滚动，不锁死页面、不裁剪控件来凑一屏。
- 一个工具放在 `src/tools/<id>/`，页面、纯转换逻辑 `model.ts`、测试同目录。工具之间不互相引用。
- `model.ts` 不依赖 React、DOM、存储或当前时间；时间和随机输入从调用方传入。
- 只有真实重复的 UI 和浏览器能力进入 shared，不创建万能表单或插件框架。
- 输入只在本机浏览器处理，不写入 URL、日志、localStorage 或外部请求；localStorage 只存主题设置。
- 主题用一个按钮显示当前状态，按「跟随系统 → 亮色 → 暗色」循环，不另放系统主题按钮；保留 `dev-tools-theme` 的 light/dark 兼容，系统主题和存储不可用时不得导致白屏。
- 新增功能或修 bug 必须补测试；禁止用 any、关闭检查、删测试来掩盖问题。
- 保持旧版全部工具与操作，参见 `docs/acceptance.md`；UI 改动对比桌面/手机、明/暗主题。
- 使用 Tailwind CSS 4 和现代浏览器，不引入旧浏览器兼容层（用户明确要求）。
- Docker 使用多阶段构建，非 root、只读运行时；浏览器端到端测试也必须能对着容器执行。
