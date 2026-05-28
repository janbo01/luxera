import { useEffect, useRef, useState, useCallback, type FC, type ReactNode } from 'react'

interface Props {
  onRefresh: () => Promise<void> | void
  children: ReactNode
}

const THRESHOLD = 80   // raw px pull required to trigger refresh
const DAMPEN    = 0.45 // visual resistance factor
const MAX_VIS   = 56   // max visual indicator travel (px)
const INDICATOR = 44   // indicator height (px)

const PullToRefresh: FC<Props> = ({ onRefresh, children }) => {
  const [pullY, setPullY]           = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [isPulling, setIsPulling]   = useState(false)

  const startY  = useRef(0)
  const rawDy   = useRef(0)
  const pulling = useRef(false)
  const busy    = useRef(false)

  const doRefresh = useCallback(async () => {
    busy.current = true
    setRefreshing(true)
    setPullY(INDICATOR)
    try {
      await onRefresh()
    } finally {
      await new Promise((r) => setTimeout(r, 350))
      busy.current = false
      setRefreshing(false)
      setPullY(0)
    }
  }, [onRefresh])

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (window.scrollY !== 0 || busy.current) return
      startY.current  = e.touches[0].clientY
      rawDy.current   = 0
      pulling.current = true
      setIsPulling(true)
    }

    const onMove = (e: TouchEvent) => {
      if (!pulling.current || busy.current) return
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0) { rawDy.current = 0; setPullY(0); return }
      rawDy.current = dy
      setPullY(Math.min(dy * DAMPEN, MAX_VIS))
    }

    const onEnd = () => {
      if (!pulling.current) return
      pulling.current = false
      setIsPulling(false)
      if (rawDy.current >= THRESHOLD) {
        doRefresh()
      } else {
        setPullY(0)
      }
      rawDy.current = 0
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove',  onMove,  { passive: true })
    document.addEventListener('touchend',   onEnd,   { passive: true })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove',  onMove)
      document.removeEventListener('touchend',   onEnd)
    }
  }, [doRefresh])

  const visible  = pullY > 0
  // Derive progress from pullY (inverse of: pullY = Math.min(dy * DAMPEN, MAX_VIS))
  const progress = Math.min(pullY / (THRESHOLD * DAMPEN), 1)

  return (
    <>
      {visible && (
        <div
          className="fixed top-0 left-1/2 z-50 w-11 h-11 rounded-full bg-surface border border-rule shadow-md grid place-items-center"
          aria-hidden="true"
          style={{
            transform: `translate(-50%, ${pullY - INDICATOR}px)`,
            transition: isPulling ? 'none' : 'transform 250ms cubic-bezier(.2,.7,.2,1)',
          }}
        >
          {refreshing ? (
            <span className="w-5 h-5 rounded-full border-2 border-rule border-t-copper animate-spin block" />
          ) : (
            <span
              className="inline-block w-4 h-4 border-l-2 border-b-2 border-copper"
              style={{ transform: `rotate(${progress * 180 - 45}deg)`, transition: 'transform 100ms' }}
            />
          )}
        </div>
      )}
      {children}
    </>
  )
}

export default PullToRefresh
