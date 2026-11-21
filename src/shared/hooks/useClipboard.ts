import { copyText } from '../browser/clipboard'
import { useToast } from '../ui/Toast'

export function useClipboard() {
  const { notify } = useToast()
  return async (text: string) => {
    try {
      await copyText(text)
      notify('已复制到剪贴板')
    } catch {
      notify('复制失败，请选中文本手动复制', 'error')
    }
  }
}
