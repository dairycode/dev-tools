# 开发工具包

纯浏览器端的开发者工具箱。基于 **React 19 + TypeScript + Vite 8 + Tailwind CSS 4**，所有转换都在本地完成，**不上传输入、不保存输入历史**。

## 功能

| 工具   | 能力                                                                     |
| ------ | ------------------------------------------------------------------------ |
| URL    | 组件编码、解码、保留网址结构的 URI 编码                                  |
| Base64 | UTF-8 中文/emoji 编解码，以及兼容旧版字节语义的 Latin-1 模式             |
| Hash   | 实时计算 MD5、SHA-1、SHA-256、SHA-512，支持去除空白/按原文计算           |
| 时间戳 | 时间戳与本地日期双向转换，自动/显式秒毫秒单位，北京、本地、UTC、ISO 结果 |
| 二维码 | 本地生成、预览、下载可扫描的 PNG，输入改变后使旧结果失效                 |
| JSON   | 无损数字精度的格式化/压缩，保留重复键/转义，树形节点及全部展开/折叠      |

支持桌面与手机、Ctrl/Cmd+Enter 快捷键、复制、工具直达链接和前进后退。主题通过一个按钮按「跟随系统 → 亮色 → 暗色」循环，兼容旧主题存储键 `dev-tools-theme`。切换工具后重置输入，不持久化敏感文本。

> Base64 不是加密；MD5/SHA-1 不能用于安全密码存储。自动识别时间戳单位是启发式规则，历史或远期时间请明确选择秒/毫秒。

## 本地开发

需要 Node.js **24.15+（24 LTS）或 26+**，使用 npm：

```bash
npm ci
npm run dev
```

默认地址：<http://127.0.0.1:3000>。

```bash
npm run build       # 类型检查 + 生产构建，产物在 dist/
npm run preview     # 预览生产构建，端口 4173
```

按用户要求以现代浏览器为目标，不保留旧版浏览器兼容层。浏览器测试覆盖 Chromium、Firefox、WebKit 及手机视口；WebKit 测试不等同于所有 iOS/Safari 真机均已实测。

## Docker 部署（推荐）

需要支持 BuildKit 的 Docker 和 Docker Compose v2.20+：

```bash
docker compose up -d --build
```

访问 <http://localhost:8080>。修改宿主端口：

```bash
PORT=9000 docker compose up -d --build
```

多阶段构建：Node 构建 → 非 root Nginx。运行容器只包含静态文件，使用只读文件系统、临时目录和健康检查，不需要 Node 服务、数据库或数据卷。

```bash
docker compose ps
docker compose logs -f --tail=100
docker compose down
```

服务器更新、HTTPS/反向代理、子路径、镜像源和回滚见 [部署说明](docs/deployment.md)。

## 验证

```bash
npm run verify
# 类型、lint、格式、单元/组件测试及核心逻辑覆盖率、生产构建

npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
# 自动构建并启动生产预览，测试三个浏览器与两种手机视口

npm run test:docker
# 构建并启动只读/非 root 容器，运行完整浏览器矩阵和 Chromium 子目录验收
# 使用独立 Compose 项目，结束后自动清理测试容器
```

容器测试默认使用 `18080`，可通过 `TEST_PORT` 修改。已有容器也可以直接验收：

```bash
E2E_CONTAINER=1 E2E_BASE_URL=http://127.0.0.1:8080/ npm run test:e2e
SUBPATH_UPSTREAM=http://127.0.0.1:8080/ npm run test:subpath -- --project=chromium
```

容器验收报告：`npx playwright show-report playwright-report/root`，子目录报告将末尾改为 `subpath`；单独运行 `test:e2e` 时用默认 `npx playwright show-report`。覆盖率报告位于 `coverage/index.html`。CI 同时保留根目录与子目录报告，执行同一条检查链，不自动向生产环境发布。

Playwright 固定 1.64.1，以避开 1.65.1 配套 Firefox 159 在本机 axe 扫描时的原生崩溃；没有删减断言。`npm ci` 使用已验证的锁文件，不要单独替换浏览器可执行文件。

## 目录

```text
src/
├── app/           # 布局、路由、唯一工具注册表、错误隔离
├── tools/         # 每工具独立目录：页面、纯 model、测试
├── shared/        # 共享 UI、hooks、剪贴板/下载/主题适配器
├── test/          # 测试初始化
└── styles.css     # Tailwind 4 入口、主题令牌、共享组件样式
tests/e2e/         # 功能、截图、无障碍、隐私、容器 HTTP 验收
docker/            # Nginx 配置
```

新增工具：新建 `src/tools/<id>/` → 编写页面与 model 测试 → 在 `src/app/registry.ts` 注册。无需再单独维护一份导航或路由列表。

页面图标统一在 `src/shared/ui/Icon.tsx` 维护，使用同一套线性 SVG；主题三态按钮位于 `src/shared/ui/ThemeToggle.tsx`。

- [架构与行为决策](docs/design.md)
- [功能矩阵与实际验收](docs/acceptance.md)
- [Docker 部署](docs/deployment.md)
- [开发约定](AGENTS.md)

## 维护注意

- `crypto-js` 已停止维护；本次为保留四种同步摘要行为继续使用，已有标准向量测试。当前 `npm audit` 无已知漏洞不代表未来永远安全，需持续跟踪依赖与基础镜像公告。
- 六个工具全部同步加载，切换不请求额外工具脚本、不显示加载占位；下拉框为页面自绘，统一主题与键盘操作。
- 真实验收数据、截图、性能开销及未覆盖的真机/部署环境见 [验收记录](docs/acceptance.md)。同步切换以增加首屏脚本为代价，不代表弱网首屏一定优于旧版。

## 许可证

[MIT](LICENSE)。
