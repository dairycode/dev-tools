import { useCallback, useEffect, type RefObject } from 'react'

export function useAutoResize(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  const resize = useCallback(() => {
    const area = ref.current
    if (area) {
      area.style.height = 'auto'
      area.style.height = area.scrollHeight + 'px'
    }
  }, [ref])

  useEffect(() => {
    resize()
  }, [value, resize])

  return resize
}
