import { useEffect, useRef, useState } from 'react'
import { ActionBar, Button, TextEditor, errorText, onShortcut } from '../../shared/ui/Controls'
import { ToolCard } from '../../shared/ui/Panels'
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
    <ToolCard className="grid items-start gap-x-6 gap-y-5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.75fr)] lg:gap-y-0">
      <TextEditor
        id="qr-input"
        label="输入内容"
        value={input}
        onChange={(event) => changeInput(event.target.value)}
        onKeyDown={onShortcut(() => void generate())}
        aria-keyshortcuts="Control+Enter Meta+Enter"
        placeholder="请输入文本、网址或其他内容…"
      />
      <ActionBar divided className="lg:col-start-1">
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
      </ActionBar>
      <div
        data-slot="qr-preview"
        className="flex min-h-75 items-center justify-center rounded-xl border border-dashed border-line bg-panel p-6 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-stretch"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <p role="status">正在生成二维码…</p>
        ) : image ? (
          <img
            className="h-auto max-w-full rounded-lg [image-rendering:pixelated]"
            src={image}
            alt="生成的二维码"
            width="240"
            height="240"
          />
        ) : (
          <div className="text-center text-quiet">
            <Icon name="qr-code" size={48} className="opacity-40" />
            <p className="mt-3">二维码预览</p>
          </div>
        )}
      </div>
    </ToolCard>
  )
}
