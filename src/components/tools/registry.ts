import { lazy } from 'react'
import { Link, Lock, Hash, Clock, QrCode, Braces } from 'lucide-react'
import type { ToolDefinition } from '../../types'

export const tools: ToolDefinition[] = [
  {
    key: 'url',
    title: 'URL 编码/解码',
    description: 'URL编码和解码工具，支持特殊字符转换',
    icon: Link,
    component: lazy(() => import('./UrlEncoder')),
  },
  {
    key: 'base64',
    title: 'Base64 编码/解码',
    description: 'Base64编码和解码工具',
    icon: Lock,
    component: lazy(() => import('./Base64Encoder')),
  },
  {
    key: 'hash',
    title: 'Hash 编码',
    description: 'MD5、SHA等Hash计算工具',
    icon: Hash,
    component: lazy(() => import('./HashEncoder')),
  },
  {
    key: 'timestamp',
    title: '时间戳转换',
    description: 'Unix时间戳与日期时间互转工具',
    icon: Clock,
    component: lazy(() => import('./TimestampConverter')),
  },
  {
    key: 'qrcode',
    title: '二维码生成',
    description: '生成文本、URL的二维码图片',
    icon: QrCode,
    component: lazy(() => import('./QrCodeGenerator')),
  },
  {
    key: 'json',
    title: 'JSON 格式化',
    description: 'JSON格式化和美化工具',
    icon: Braces,
    component: lazy(() => import('./JsonFormatter')),
  },
]
