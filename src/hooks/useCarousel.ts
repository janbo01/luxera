import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Shared logic for RTL horizontal snap carousels: tracks whether the
 * track can scroll either way and scrolls one "page" (as many whole
 * cards as fit) at a time. In RTL, scrollLeft runs from 0 to negative
 * values — hence the inverted comparisons.
 */
export function useCarousel(itemCount: number) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const syncArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft < -2)
    setCanNext(el.scrollLeft > -(el.scrollWidth - el.clientWidth - 2))
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', syncArrows, { passive: true })
    // ResizeObserver's initial callback fires with the current size shortly
    // after observe(), so it covers the mount-time sync without an extra
    // forced-layout read from a redundant requestAnimationFrame call.
    const ro = new ResizeObserver(syncArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', syncArrows)
      ro.disconnect()
    }
  }, [itemCount, syncArrows])

  const scroll = useCallback((dir: 'prev' | 'next') => {
    const el = trackRef.current
    if (!el) return
    const card = el.firstElementChild
    const cardW = card?.getBoundingClientRect().width ?? 280
    const gap = parseFloat(getComputedStyle(el).columnGap) || 20
    const step = (cardW + gap) * Math.max(1, Math.floor(el.clientWidth / (cardW + gap)))
    el.scrollBy({ left: dir === 'prev' ? step : -step, behavior: 'smooth' })
  }, [])

  return { trackRef, canPrev, canNext, scroll }
}
