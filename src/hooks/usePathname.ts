import { useState, useEffect } from 'react'

export function usePathname(): string {
  const [pathname, setPathname] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/',
  )
  useEffect(() => {
    const update = () => setPathname(window.location.pathname)
    document.addEventListener('astro:page-load', update)
    return () => document.removeEventListener('astro:page-load', update)
  }, [])
  return pathname
}
