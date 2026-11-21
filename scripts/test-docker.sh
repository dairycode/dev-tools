#!/bin/sh
set -eu

export COMPOSE_PROJECT_NAME="dev-tools-verify-$$"
export PORT="${TEST_PORT:-18080}"
export DEV_TOOLS_IMAGE="dev-tools:verify"

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
