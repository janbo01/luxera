import { useEffect } from 'react'
import type { TransitionBeforePreparationEvent } from 'astro:transitions/client'

export default function ScrollToTop() {
  useEffect(() => {
    // Back/forward must keep the scroll position the router just restored — jumping to the
    // top there loses the shopper's place in the list (and the photo's morph back into its card).
    let traverse = false
    const onPrepare = (e: Event) => {
      traverse = (e as TransitionBeforePreparationEvent).navigationType === 'traverse'
    }
    const onLoad = () => {
      if (!traverse) window.scrollTo(0, 0)
      traverse = false
    }
    document.addEventListener('astro:before-preparation', onPrepare)
    document.addEventListener('astro:page-load', onLoad)
    return () => {
      document.removeEventListener('astro:before-preparation', onPrepare)
      document.removeEventListener('astro:page-load', onLoad)
    }
  }, [])
  return null
}
