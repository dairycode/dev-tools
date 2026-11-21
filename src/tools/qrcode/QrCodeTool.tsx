import { useEffect, useRef, useState } from 'react'
import { Button, TextArea, errorText, onShortcut } from '../../shared/ui/Controls'
import { Icon } from '../../shared/ui/Icon'
import { useToast } from '../../shared/ui/Toast'
import { downloadImage } from '../../shared/browser/download'
import { createQrMatrix } from './model'
import { renderQrImage } from './render'

export default function QrCodeTool() {
  const [input, setInput] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(false)
  const request = useRef(0)
  const { notify, dismiss } = useToast()
  useEffect(
    () => () => {
      request.current++
    },
    [],
  )
  function changeInput(text: string) {
    request.current++
    setInput(text)
    setImage(null)
    setLoading(false)
  }
  async function generate() {
    const current = ++request.current
    setImage(null)
    setLoading(true)
    try {
      // 先让浏览器绘制加载状态；过期任务不得更新结果。
      await new Promise<void>((resolve) => setTimeout(resolve, 0))
      if (current !== request.current) return
      const output = renderQrImage(createQrMatrix(input))
      if (current === request.current) {
        setImage(output)
        notify('二维码生成成功')
      }
    } catch (error) {
      if (current === request.current) notify(errorText(error), 'error')
    } finally {
      if (current === request.current) setLoading(false)
    }
  }
  function download() {
    if (!image) return
    try {
      downloadImage(image, 'qrcode.png')
      notify('已开始下载二维码')
    } catch (error) {
      notify(errorText(error), 'error')
    }
  }
  return (
    <div className="tool-card qr-tool">
      <div className="field">
        <label htmlFor="qr-input">输入内容</label>
        <TextArea
          id="qr-input"
          value={input}
          onChange={(event) => changeInput(event.target.value)}
          onKeyDown={onShortcut(() => void generate())}
          aria-keyshortcuts="Control+Enter Meta+Enter"
          placeholder="请输入文本、网址或其他内容…"
        />
      </div>
      <div className="action-bar">
        <Button variant="primary" disabled={isLoading} onClick={() => void generate()}>
          {isLoading ? '生成中…' : '生成二维码'}
        </Button>
        <Button disabled={!image || isLoading} onClick={download}>
          下载二维码
        </Button>
        <Button
          variant="clear"
          onClick={() => {
            changeInput('')
            dismiss()
          }}
        >
          清空
        </Button>
      </div>
      <div className="qr-preview" aria-busy={isLoading}>
        {isLoading ? (
          <p role="status">正在生成二维码…</p>
        ) : image ? (
          <img src={image} alt="生成的二维码" width="240" height="240" />
        ) : (
          <div className="qr-placeholder">
            <Icon name="qr-code" size={48} />
            <p>二维码预览</p>
          </div>
        )}
      </div>
    </div>
  )
}
