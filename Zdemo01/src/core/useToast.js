import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, timeout = 2000) => {
    setToast(message)
    if (timeout) {
      setTimeout(() => setToast(null), timeout)
    }
  }, [])

  return { toast, showToast, hideToast: () => setToast(null) }
}
