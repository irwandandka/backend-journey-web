import { useEffect, useState } from 'react'

export function useToast() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (message === null) return

    const timer = setTimeout(() => setMessage(null), 2400)

    return () => clearTimeout(timer)
  }, [message])

  const node = (
    <div className={`toast${message === null ? '' : ' on'}`} role="status" aria-live="polite">
      {message ?? ''}
    </div>
  )

  return { show: setMessage, node }
}
