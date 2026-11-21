# Docker 与静态部署

## 一键部署

在仓库目录执行：

```bash
docker compose up -d --build
curl -f http://localhost:8080/healthz
```

默认对外暴露宿主 `8080`，容器内部也是 `8080`。`PORT=9000 docker compose up -d --build` 可改宿主端口。生产环境请配合防火墙，仅开放需要的端口。

需要 Docker BuildKit（当前 Docker 默认启用）和 Compose v2.20+。首次构建需要访问 npm 与基础镜像仓库；运行阶段不需要 npm 或外部业务 API。没有数据库、持久化卷或必须传入的环境变量。

## 镜像结构与运行约束

- Node 24 LTS 构建阶段执行 `npm ci`、类型检查和生产构建。
- Nginx unprivileged 运行阶段，仅复制 dist，不包含 Node、源码、node_modules。
- UID/GID 为 `101:101`，监听 8080。Compose 设置只读文件系统、`/tmp` 临时挂载、移除 capabilities 和禁止提权。
- `/healthz` 返回 `ok`，Docker 每 30 秒检查；启动后可用 `docker compose ps` 查看健康状态。
- `index.html` 要求重新验证缓存；带内容指纹的 assets 长期缓存；缺失 JS/CSS 返回 404，不返回 HTML。
- 构建时预压缩静态文件，Nginx 优先发送 gzip 文件并保留动态压缩兜底；正确 MIME、nosniff、禁止 iframe 嵌入等响应头。CSP 禁止 connect 请求；保留的内联脚本用于首屏主题初始化。

脱离 Compose 单独运行时，必须提供可写临时目录：

```bash
docker build -t dev-tools:local .
docker run -d --name dev-tools \
  --read-only --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --cap-drop ALL --security-opt no-new-privileges:true \
  --restart unless-stopped -p 8080:8080 dev-tools:local
```

## 基础镜像源

Dockerfile 默认使用公开的 AWS ECR 镜像，分别来自 Docker Official Images 的 Node 和 Nginx 官方 unprivileged 发布，并固定 digest，避免 tag 漂移。此选择也绕过当前环境无法访问 Docker Hub 的网络限制。

如所在环境可访问 Docker Hub，可显式选择其他已审核版本：

```bash
docker build \
  --build-arg NODE_IMAGE=node:24-alpine \
  --build-arg NGINX_IMAGE=nginxinc/nginx-unprivileged:stable-alpine \
  -t dev-tools:local .
```

替换基础镜像后重新执行容器测试。维护更新时应核对 tag、digest、Node 最低版本和镜像安全公告，而不是长期不更新 digest。

## 更新与回滚

建议按 Git 提交号构建镜像，而不是复用一个不可追踪的 latest：

```bash
TAG=$(git rev-parse --short HEAD)
docker build -t dev-tools:$TAG .
DEV_TOOLS_IMAGE=dev-tools:$TAG docker compose up -d --no-build
```

回滚：保留上一版镜像，将 `DEV_TOOLS_IMAGE` 改回上一版标签后重新 `up -d --no-build`。每次更新会重建容器，单副本存在短暂中断；不宣称零停机。

未提交工作区构建时，请自行使用独立标签，Git SHA 并不能区分工作区中的未提交修改。

## 域名与 HTTPS

可由宿主 Nginx、Caddy、Traefik 等反向代理到 `http://127.0.0.1:8080`。TLS 在外层终止，应用镜像不绑定域名。推荐 HTTPS，Clipboard API 在非安全上下文中可能不可用，应用会尝试兼容复制，失败时提示手动复制。

前端不存在保密的 `VITE_*` 环境变量。修改容器的 `docker run -e` 不会自动改写已构建的 JS；目前没有需要运行时注入的 API 地址。

## 子目录部署

应用使用相对资源地址和 hash 路由。例如 `https://example.com/dev-tools/#/json`：

- 代理可将 `/dev-tools/` 前缀剥离后转发给容器根目录；必须同时代理该前缀下的 assets、favicon。
- 或把 dist 放在静态服务器的 `/dev-tools/` 目录。无需为 `#/json` 配置服务端路由回退。
- 目录地址应以 `/` 结尾，避免相对路径落到错误层级。
- 不要将缺失 assets 的请求统一回退到 index.html。

## 不同服务器架构

默认构建本机架构。Apple Silicon 与常见 x86 Linux 的架构不同，传输镜像前需按目标构建：

```bash
docker buildx build --platform linux/amd64 --load -t dev-tools:amd64 .
# ARM 服务器则使用 --platform linux/arm64
```

基础镜像为多架构索引；最终实际验证了哪些架构，请以 acceptance.md 中的记录为准，不将能选择平台等同于已经完成对应平台验收。

## 部署验收

```bash
npm ci
npx playwright install --with-deps chromium firefox webkit
npm run verify
npm run test:docker
```

测试脚本使用独立 Compose 项目和 18080 端口，检测真实运行用户、只读设置、健康、缓存、gzip、MIME、404，再运行完整浏览器流程，并通过本地反向代理跑 Chromium 子目录流程，退出时清理测试容器。脚本不上传镜像、不自动部署到远端服务器。

已有容器可单独测试 `/dev-tools/` 前缀剥离场景：

```bash
SUBPATH_UPSTREAM=http://127.0.0.1:8080/ npm run test:subpath -- --project=chromium
```

代理只监听本机随机端口，并在测试结束后关闭；测试资源依旧由该容器返回。它不是生产代理配置，也不证明任意第三方网关配置都正确。
