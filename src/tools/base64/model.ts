export type TextEncoding = 'utf8' | 'latin1'

export function encodeBase64(text: string, encoding: TextEncoding = 'utf8'): string {
  if (!text.trim()) throw new Error('请输入要编码的文本')
  if (encoding === 'latin1') return btoa(text)
  const bytes = new TextEncoder().encode(text)
  const chunks: string[] = []
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 0x8000)))
  }
  return btoa(chunks.join(''))
}

export function decodeBase64(text: string, encoding: TextEncoding = 'utf8'): string {
  const normalized = text.trim()
  const pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
  if (!normalized || !pattern.test(normalized)) throw new Error('请输入有效的 Base64 文本')
  const binary = atob(normalized)
  if (encoding === 'latin1') return binary
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(
      Uint8Array.from(binary, (character) => character.charCodeAt(0)),
    )
  } catch {
    throw new Error('解码结果不是有效的 UTF-8 文本，请尝试 Latin-1 兼容模式')
  }
}
