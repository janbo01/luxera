import { useEffect } from 'react'

const BASE = 'Luxera · لوکسرا'

export function usePageMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : BASE

    if (description) {
      const el = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (el) el.content = description
    }

    return () => {
      document.title = BASE
    }
  }, [title, description])
}
