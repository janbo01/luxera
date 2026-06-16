import { useEffect } from 'react'

export default function ScrollToTop() {
  useEffect(() => {
    const onLoad = () => window.scrollTo(0, 0)
    document.addEventListener('astro:page-load', onLoad)
    return () => document.removeEventListener('astro:page-load', onLoad)
  }, [])
  return null
}
