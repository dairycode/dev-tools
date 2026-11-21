import UrlTool from '../tools/url/UrlTool'
import Base64Tool from '../tools/base64/Base64Tool'
import HashTool from '../tools/hash/HashTool'
import TimestampTool from '../tools/timestamp/TimestampTool'
import QrCodeTool from '../tools/qrcode/QrCodeTool'
import JsonTool from '../tools/json/JsonTool'

export const tools = [
  {
    id: 'url',
    title: 'URL 编码/解码',
    icon: 'link',
    component: UrlTool,
  },
  {
    id: 'base64',
    title: 'Base64 编码/解码',
    icon: 'binary',
    component: Base64Tool,
  },
  {
    id: 'hash',
    title: 'Hash 计算',
    icon: 'hash',
    component: HashTool,
  },
  {
    id: 'timestamp',
    title: '时间戳转换',
    icon: 'clock',
    component: TimestampTool,
  },
  {
    id: 'qrcode',
    title: '二维码生成',
    icon: 'qr-code',
    component: QrCodeTool,
  },
  {
    id: 'json',
    title: 'JSON 格式化',
    icon: 'braces',
    component: JsonTool,
  },
] as const
export type ToolDefinition = (typeof tools)[number]
