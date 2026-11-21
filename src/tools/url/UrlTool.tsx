import { TextTransformPanel } from '../../shared/ui/TextTransformPanel'
import { transformUrl } from './model'

export default function UrlTool() {
  return (
    <TextTransformPanel
      id="url-input"
      actions={[
        { label: '编码', title: '编码单个 URL 参数', run: (text) => transformUrl(text, 'encode') },
        { label: '解码', run: (text) => transformUrl(text, 'decode') },
        {
          label: 'URI编码',
          title: '保留网址结构进行编码',
          run: (text) => transformUrl(text, 'uri'),
        },
      ]}
    />
  )
}
