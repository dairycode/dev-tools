#!/bin/sh
set -eu

export COMPOSE_PROJECT_NAME="dev-tools-verify-$$"
export PORT="${TEST_PORT:-18080}"
export DEV_TOOLS_IMAGE="dev-tools:verify"
export DOCKER_NETWORK_NAME="${COMPOSE_PROJECT_NAME}-network"

cleanup() {
  status=$?
  trap - EXIT INT TERM
  if ! docker compose down --remove-orphans; then
    echo "清理测试容器失败，请检查 Compose 项目：${COMPOSE_PROJECT_NAME}" >&2
    if [ "$status" -eq 0 ]; then status=1; fi
  fi
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

docker compose config --quiet
docker compose build
docker compose up -d --wait --wait-timeout 60
container="$(docker compose ps -q dev-tools)"
network="$DOCKER_NETWORK_NAME"
if [ "$(docker inspect --format '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}}{{end}}' "$container")" != "$network" ]; then
  echo "容器必须只连接项目自建网络：${network}" >&2
  exit 1
fi
if [ "$(docker network inspect --format '{{.Driver}}' "$network")" != 'bridge' ]; then
  echo '项目自建网络必须使用 bridge 驱动' >&2
  exit 1
fi
if [ "$(docker inspect --format '{{(index (index .NetworkSettings.Ports "8001/tcp") 0).HostPort}}' "$container")" != "$PORT" ]; then
  echo "容器 8001 端口必须映射到宿主 ${PORT} 端口" >&2
  exit 1
fi
if [ "$(docker inspect --format '{{.HostConfig.ReadonlyRootfs}}' "$container")" != 'true' ]; then
  echo '容器必须使用只读文件系统' >&2
  exit 1
fi
if [ "$(docker compose exec -T dev-tools id -u)" != '101' ]; then
  echo '容器必须以非 root 用户 101 运行' >&2
  exit 1
fi
E2E_CONTAINER=1 E2E_BASE_URL="http://127.0.0.1:${PORT}/" \
  PLAYWRIGHT_HTML_OUTPUT_DIR=playwright-report/root \
  npm run test:e2e -- --output=test-results/root "$@"
SUBPATH_UPSTREAM="http://127.0.0.1:${PORT}/" \
  PLAYWRIGHT_HTML_OUTPUT_DIR=playwright-report/subpath \
  npm run test:subpath -- --project=chromium --output=test-results/subpath
