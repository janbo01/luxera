import { useEffect } from 'react'

// Overlays can stack (e.g. the login modal over the cart drawer), so locks are counted and the
// page only unlocks when the last one releases.
let locks = 0

/**
 * Locks page scroll while `active` is true. Cleans up on unmount.
 *
 * The lock goes on <html>, not <body>: html's overflow is applied to the viewport, which stops
 * scrolling and leaves position: sticky (header, gallery, filter panel) working. overflow on
 * <body> instead turns body into its own scroll container — every sticky element un-sticks and
 * jumps away while the overlay is open.
 */
export function useBodyLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    if (locks++ === 0) document.documentElement.style.overflow = 'hidden'
    return () => {
      if (--locks === 0) document.documentElement.style.overflow = ''
    }
  }, [active])
}
