import { useEffect } from 'react'
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client'
import { isProductMorphActive } from '../../utils/productMorph'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Glide the current page to the top. Fixed-length rather than `behavior: 'smooth'`, whose
 * duration grows with distance (seconds from a long page's footer). Settles early if the
 * navigation is aborted or the shopper scrolls themselves.
 */
function glideToTop(signal: AbortSignal): Promise<void> {
  const start = window.scrollY
  // Hidden tabs get no animation frames; the router resets the scroll on swap anyway.
  if (start < 2 || document.hidden) return Promise.resolve()
  const duration = Math.min(560, 300 + start * 0.04)
  const ease = (t: number) => 1 - Math.pow(1 - t, 3)
  return new Promise((resolve) => {
    let raf = 0
    const t0 = performance.now()
    // Never hold the navigation hostage: if frames stall (tab hidden mid-glide), move on.
    const cap = window.setTimeout(() => stop(), duration + 150)
    const stop = () => {
      window.clearTimeout(cap)
      cancelAnimationFrame(raf)
      removeEventListener('wheel', stop)
      removeEventListener('touchstart', stop)
      signal.removeEventListener('abort', stop)
      resolve()
    }
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      window.scrollTo({ top: Math.round(start * (1 - ease(t))), behavior: 'instant' })
      if (t < 1) raf = requestAnimationFrame(step)
      else stop()
    }
    addEventListener('wheel', stop, { passive: true, once: true })
    addEventListener('touchstart', stop, { passive: true, once: true })
    signal.addEventListener('abort', stop, { once: true })
    raf = requestAnimationFrame(step)
  })
}

/**
 * Every page change starts at the top. The old page glides up while the next one loads (in
 * parallel, so it adds no wait), and the swap then lands already at the top. Back/forward keep
 * the restored position, links to a #section scroll to it, and card → product clicks keep
 * their photo morph, which needs the card where it is.
 */
export default function ScrollToTop() {
  useEffect(() => {
    let traverse = false
    let toHash = false
    // Where the old page was before gliding. The router saves it for Back, but its own scroll
    // listener then overwrites that with the glide's 0, so it's written back before the swap.
    let leftAt: { x: number; y: number } | null = null
    const restoreSaved = () => {
      if (!leftAt || !history.state) return
      history.replaceState({ ...history.state, scrollX: leftAt.x, scrollY: leftAt.y }, '')
    }
    const onPrepare = (e: Event) => {
      const ev = e as TransitionBeforePreparationEvent
      traverse = ev.navigationType === 'traverse'
      toHash = ev.to.hash !== ''
      leftAt = null
      if (traverse || toHash || isProductMorphActive() || reducedMotion()) return
      leftAt = { x: window.scrollX, y: window.scrollY }
      const load = ev.loader
      ev.loader = async () => {
        await Promise.all([load(), glideToTop(ev.signal)])
        restoreSaved()
      }
    }
    const onBeforeSwap = () => {
      restoreSaved()
      leftAt = null
    }
    // Safety net after the swap: islands that render late can nudge the scroll position.
    const onLoad = () => {
      if (!traverse && !toHash) window.scrollTo({ top: 0, behavior: 'instant' })
      traverse = false
      toHash = false
    }
    document.addEventListener('astro:before-preparation', onPrepare)
    document.addEventListener('astro:before-swap', onBeforeSwap)
    document.addEventListener('astro:page-load', onLoad)
    return () => {
      document.removeEventListener('astro:before-preparation', onPrepare)
      document.removeEventListener('astro:before-swap', onBeforeSwap)
      document.removeEventListener('astro:page-load', onLoad)
    }
  }, [])
  return null
}
