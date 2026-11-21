export type UrlOperation = 'encode' | 'decode' | 'uri'

export function transformUrl(text: string, operation: UrlOperation): string {
  if (!text.trim()) throw new Error('请输入要转换的文本')
  switch (operation) {
    case 'encode':
      return encodeURIComponent(text)
    case 'decode':
      return decodeURIComponent(text)
    case 'uri':
      return encodeURI(text)
  }
}
