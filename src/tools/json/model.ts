import { isLosslessNumber, parse, type LosslessNumber } from 'lossless-json'
import { applyEdits, createScanner, format } from 'jsonc-parser'

export type JsonValue =
  null | boolean | string | LosslessNumber | JsonValue[] | { [key: string]: JsonValue }
export const TREE_NODE_LIMIT = 2000
export const TREE_DEPTH_LIMIT = 40

export function parseJson(text: string): JsonValue {
  if (!text.trim()) throw new Error('请输入 JSON 数据')
  // 树视图与旧版 JSON.parse 一样以最后一个重复键为准；文本转换仍保留所有键。
  return parse(text, null, { onDuplicateKey: ({ newValue }) => newValue }) as JsonValue
}

export function formatJson(text: string, indentation: 0 | 2 = 2): string {
  parseJson(text)
  // 仅编辑原始 token 之间的空白，不重序列化数字、字符串转义或重复键。
  if (indentation === 2) {
    return applyEdits(
      text,
      format(text, undefined, { tabSize: 2, insertSpaces: true, eol: '\n' }),
    ).trim()
  }
  const scanner = createScanner(text, true)
  const tokens: string[] = []
  scanner.scan()
  while (scanner.getTokenLength() > 0) {
    const offset = scanner.getTokenOffset()
    tokens.push(text.slice(offset, offset + scanner.getTokenLength()))
    scanner.scan()
  }
  return tokens.join('')
}

export function isContainer(value: JsonValue): value is JsonValue[] | { [key: string]: JsonValue } {
  return value !== null && typeof value === 'object' && !isLosslessNumber(value)
}

export function childPath(parent: string, key: string): string {
  return `${parent}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`
}

export function inspectTree(value: JsonValue): {
  paths: string[]
  isLimited: boolean
  count: number
} {
  const pending = [{ value, path: '', depth: 0 }]
  const paths: string[] = []
  let count = 0
  while (pending.length) {
    const node = pending.pop()
    if (!node) break
    count++
    if (count > TREE_NODE_LIMIT || node.depth > TREE_DEPTH_LIMIT)
      return { paths, isLimited: true, count }
    if (!isContainer(node.value)) continue
    paths.push(node.path)
    const keys = Object.keys(node.value)
    if (keys.length + pending.length + count > TREE_NODE_LIMIT)
      return { paths, isLimited: true, count }
    for (const key of keys) {
      const child = (node.value as Record<string, JsonValue>)[key]
      if (child !== undefined)
        pending.push({ value: child, path: childPath(node.path, key), depth: node.depth + 1 })
    }
  }
  return { paths, isLimited: false, count }
}

export function displayJsonValue(value: JsonValue): string {
  if (isLosslessNumber(value)) return value.value
  return JSON.stringify(value)
}
