import { useEffect } from 'react'

const BASE_TITLE = 'Luxera · لوکسرا'
const SITE_URL = 'https://luxera.ir'

interface PageMetaOptions {
  title: string
  description?: string
  canonical?: string
  ogImage?: string
  jsonLd?: Record<string, unknown>
  noIndex?: boolean
}

function setMetaContent(selector: string, value: string) {
  const el = document.querySelector<HTMLMetaElement>(selector)
  if (el) el.content = value
}

export function usePageMeta({ title, description, canonical, ogImage, jsonLd, noIndex }: PageMetaOptions) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : undefined

  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE
    const canonicalUrl = canonical
      ? `${SITE_URL}${canonical}`
      : `${SITE_URL}${window.location.pathname}`

    document.title = fullTitle

    // Canonical link
    const canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonicalEl) canonicalEl.href = canonicalUrl

    // Robots
    const robotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (robotsEl) robotsEl.content = noIndex ? 'noindex, nofollow' : 'index, follow'

    // Description
    if (description) {
      setMetaContent('meta[name="description"]', description)
    }

    // Open Graph
    setMetaContent('meta[property="og:title"]', fullTitle)
    setMetaContent('meta[property="og:url"]', canonicalUrl)
    if (description) setMetaContent('meta[property="og:description"]', description)
    if (ogImage) setMetaContent('meta[property="og:image"]', ogImage)

    // Twitter Card
    setMetaContent('meta[name="twitter:title"]', fullTitle)
    if (description) setMetaContent('meta[name="twitter:description"]', description)
    if (ogImage) setMetaContent('meta[name="twitter:image"]', ogImage)

    // JSON-LD structured data
    let ldEl = document.getElementById('jsonld-page') as HTMLScriptElement | null
    if (jsonLdString) {
      if (!ldEl) {
        ldEl = document.createElement('script')
        ldEl.id = 'jsonld-page'
        ldEl.type = 'application/ld+json'
        document.head.appendChild(ldEl)
      }
      ldEl.textContent = jsonLdString
    } else {
      ldEl?.remove()
    }

    return () => {
      document.title = BASE_TITLE
      if (canonicalEl) canonicalEl.href = `${SITE_URL}/`
      if (robotsEl) robotsEl.content = 'index, follow'
      document.getElementById('jsonld-page')?.remove()
    }
  }, [title, description, canonical, ogImage, jsonLdString, noIndex])
}
