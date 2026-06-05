import { useState, useRef, useEffect } from 'react'

interface ZoomState {
  scale: number
  x: number
  y: number
}

interface UseGalleryOptions {
  count: number
}

export function useGallery({ count }: UseGalleryOptions) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, x: 0, y: 0 })
  const zoomRef = useRef<ZoomState>({ scale: 1, x: 0, y: 0 })
  const mainRef = useRef<HTMLDivElement>(null)
  const gesture = useRef({
    startScale: 1,
    startSpread: 0,
    startX: 0,
    startY: 0,
    panStartX: 0,
    panStartY: 0,
    panStartTx: 0,
    panStartTy: 0,
    lastTapTime: 0,
    lastTapX: 0,
    lastTapY: 0,
    // Cached once at touchstart to avoid layout reads on every touchmove
    containerW: 0,
    containerH: 0,
  })

  const applyZoom = (next: ZoomState) => {
    zoomRef.current = next
    setZoom(next)
  }

  const clampPos = (x: number, y: number, s: number) => {
    if (s <= 1) return { x: 0, y: 0 }
    // Use dimensions cached at gesture start — no layout read on every touchmove
    const hw = (gesture.current.containerW * (s - 1)) / 2
    const hh = (gesture.current.containerH * (s - 1)) / 2
    return {
      x: Math.max(-hw, Math.min(hw, x)),
      y: Math.max(-hh, Math.min(hh, y)),
    }
  }

  const getSpread = (t: { [n: number]: { clientX: number; clientY: number } }) => {
    const dx = t[1].clientX - t[0].clientX
    const dy = t[1].clientY - t[0].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const g = gesture.current
    // Cache container size once per gesture — avoids layout reads during touchmove
    const el = mainRef.current
    if (el) { g.containerW = el.clientWidth; g.containerH = el.clientHeight }
    if (e.touches.length === 2) {
      g.startScale  = zoomRef.current.scale
      g.startSpread = getSpread(e.touches)
      g.startX      = zoomRef.current.x
      g.startY      = zoomRef.current.y
    } else if (e.touches.length === 1) {
      const t   = e.touches[0]
      const now = Date.now()
      if (
        now - g.lastTapTime < 280 &&
        Math.abs(t.clientX - g.lastTapX) < 40 &&
        Math.abs(t.clientY - g.lastTapY) < 40
      ) {
        applyZoom(zoomRef.current.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2, x: 0, y: 0 })
        g.lastTapTime = 0
        return
      }
      g.lastTapTime = now
      g.lastTapX    = t.clientX
      g.lastTapY    = t.clientY
      g.panStartX   = t.clientX
      g.panStartY   = t.clientY
      g.panStartTx  = zoomRef.current.x
      g.panStartTy  = zoomRef.current.y
    }
  }

  const handleTouchEnd = () => {
    if (zoomRef.current.scale < 1.1) applyZoom({ scale: 1, x: 0, y: 0 })
  }

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    const onMove = (e: TouchEvent) => {
      const g = gesture.current
      if (e.touches.length === 2) {
        e.preventDefault()
        const newSpread = getSpread(e.touches)
        const newScale  = Math.min(3, Math.max(1, g.startScale * (newSpread / g.startSpread)))
        const clamped   = clampPos(g.startX, g.startY, newScale)
        applyZoom({ scale: newScale, ...clamped })
      } else if (e.touches.length === 1 && zoomRef.current.scale > 1) {
        e.preventDefault()
        const t  = e.touches[0]
        const dx = t.clientX - g.panStartX
        const dy = t.clientY - g.panStartY
        applyZoom({
          scale: zoomRef.current.scale,
          ...clampPos(g.panStartTx + dx, g.panStartTy + dy, zoomRef.current.scale),
        })
      }
    }

    el.addEventListener('touchmove', onMove, { passive: false })
    return () => el.removeEventListener('touchmove', onMove)
  }, [])

  const selectThumb = (i: number) => {
    setActiveIdx(i)
    if (zoomRef.current.scale > 1) applyZoom({ scale: 1, x: 0, y: 0 })
  }

  const toggleZoom = () => {
    applyZoom(zoomRef.current.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2, x: 0, y: 0 })
  }

  const goNext = () => selectThumb((activeIdx + 1) % count)
  const goPrev = () => selectThumb((activeIdx - 1 + count) % count)

  return {
    activeIdx,
    zoom,
    mainRef,
    isZoomed: zoom.scale > 1,
    selectThumb,
    toggleZoom,
    goNext,
    goPrev,
    handleTouchStart,
    handleTouchEnd,
  }
}
