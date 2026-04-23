import { useState, useCallback, useRef } from 'react'
import type { MessageType } from '../types'

export function useMessage() {
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('success')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const showMessage = useCallback((text: string, type: MessageType) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessage(text)
    setMessageType(type)
    timerRef.current = setTimeout(() => setMessage(''), 3000)
  }, [])

  const clearMessage = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMessage('')
  }, [])

  return { message, messageType, showMessage, clearMessage }
}
