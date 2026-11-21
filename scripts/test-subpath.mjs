import http from 'node:http'
import { once } from 'node:events'
import { spawn } from 'node:child_process'

function parseUpstream(value) {
  try {
    return new URL(value)
  } catch {
    throw new Error('SUBPATH_UPSTREAM 不是合法 URL，请传入本机 HTTP 测试容器地址')
  }
}
const upstream = parseUpstream(process.env.SUBPATH_UPSTREAM ?? 'http://127.0.0.1:18080/')
if (
  upstream.protocol !== 'http:' ||
  !['127.0.0.1', 'localhost'].includes(upstream.hostname) ||
  upstream.username ||
  upstream.password
) {
  throw new Error('SUBPATH_UPSTREAM 必须指向本机 HTTP 测试容器')
}
const prefix = '/dev-tools/'
// 模拟生产反向代理剥离子目录前缀，资源和页面仍全部由真实容器返回。
const server = http.createServer((request, response) => {
  if (!request.url?.startsWith(prefix)) {
    response.writeHead(404).end('Not found')
    return
  }
  const forwarded = http.request(
    upstream,
    {
      path: request.url.slice(prefix.length - 1),
      method: request.method,
      headers: { ...request.headers, host: upstream.host },
    },
    (result) => {
      response.writeHead(result.statusCode ?? 502, result.headers)
      result.on('error', (error) => response.destroy(error))
      result.pipe(response)
    },
  )
  forwarded.on('error', () => {
    if (!response.headersSent) response.writeHead(502)
    response.end('Test upstream unavailable')
  })
  request.on('error', (error) => forwarded.destroy(error))
  response.on('close', () => forwarded.destroy())
  request.pipe(forwarded)
})
server.listen(0, '127.0.0.1')
await once(server, 'listening')
const address = server.address()
if (!address || typeof address === 'string') throw new Error('无法获取子目录测试端口')
const child = spawn(
  process.execPath,
  ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      E2E_CONTAINER: '1',
      E2E_BASE_URL: `http://127.0.0.1:${address.port}${prefix}`,
    },
  },
)
const interrupt = () => child.kill('SIGINT')
const terminate = () => child.kill('SIGTERM')
process.once('SIGINT', interrupt)
process.once('SIGTERM', terminate)
try {
  const [code] = await once(child, 'exit')
  process.exitCode = code ?? 1
} finally {
  process.off('SIGINT', interrupt)
  process.off('SIGTERM', terminate)
  server.closeAllConnections()
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  )
}
