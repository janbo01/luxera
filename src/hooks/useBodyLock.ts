import { useEffect } from 'react'

/** Locks body scroll while `active` is true. Cleans up on unmount. */
export function useBodyLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [active])
}
