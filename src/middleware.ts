import { defineMiddleware } from 'astro:middleware'
import { cspHash } from './lib/ssr'
import { READER_JS } from './lib/hydrateReader'

// HydrateReader's inline script. Its hash is added here because Astro sends the CSP
// header before layout/component frontmatter runs, so Astro.csp.insertScriptHash() from
// there never reached the header and the browser blocked the reader on every page.
const READER_HASH = `'${cspHash(READER_JS)}'`

// Astro's auto-hashed style-src (astro.config.mjs `security.csp`) always includes hashes
// for the inlined Tailwind bundle + astro-island runtime CSS, and once ANY hash is present
// in a directive, browsers ignore 'unsafe-inline' for it (CSP spec, confirmed empirically).
// That breaks two things hashing can't cover: React's `style={{...}}` prop on ~50
// components, and Astro's ClientRouter, which sets inline `style="view-transition-name"`
// during page transitions. script-src (the actual XSS-relevant directive Lighthouse flagged)
// keeps its strict hash allowlist untouched — only style-src is relaxed here.
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next()
  const csp = response.headers.get('content-security-policy')
  if (csp) {
    response.headers.set(
      'content-security-policy',
      csp
        .replace(/style-src[^;]*/, "style-src 'self' 'unsafe-inline'")
        .replace(/script-src([^;]*)/, (m) => (m.includes(READER_HASH) ? m : `${m} ${READER_HASH}`)),
    )
  }
  return response
})
