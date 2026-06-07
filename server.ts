import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import express from 'express'
import compression from 'compression'
import { CATEGORIES } from './src/data/categories'
import { deriveThemeCSS } from './src/utils/themeTokens'

// Unwrap API envelope: { success, data } → data, or return as-is
function unwrap(json: unknown): unknown {
  if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>
    if ('success' in o && 'data' in o) return o.data
  }
  return json
}

// Escape </script> inside inline JSON blobs
function safeJson(val: unknown): string {
  return JSON.stringify(val).replace(/<\/script>/gi, '<\\/script>')
}

// Server-side category cache (avoids a round-trip on every /category/:id request)
let _catCache: Array<{ id: string; name: string }> = []
let _catExpiry = 0
async function fetchCategories(base: string): Promise<Array<{ id: string; name: string }>> {
  if (_catCache.length && Date.now() < _catExpiry) return _catCache
  const r = await fetch(`${base}/categories`)
  if (!r.ok) return []
  _catCache = (unwrap(await r.json()) as Array<{ id: string; name: string }>) ?? []
  _catExpiry = Date.now() + 15 * 60 * 1000
  return _catCache
}

// Server-side collections cache (for footer links)
let _colCache: Array<{ id: string; slug: string; name_fa: string }> = []
let _colExpiry = 0
async function fetchFooterCollections(base: string): Promise<Array<{ id: string; slug: string; name_fa: string }>> {
  if (_colCache.length && Date.now() < _colExpiry) return _colCache
  const r = await fetch(`${base}/collections`)
  if (!r.ok) return []
  const raw = unwrap(await r.json()) as { items?: Array<{ id: string; slug: string; name_fa: string }> }
  _colCache = raw?.items ?? []
  _colExpiry = Date.now() + 15 * 60 * 1000
  return _colCache
}

const isProd = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT) || 3000
const root = process.cwd()

const storeApiBase   = process.env.VITE_STORE_API   ?? ''
const productApiBase = process.env.VITE_PRODUCT_API ?? ''

// Theme CSS cache — 24h TTL matches the store service's Redis TTL for settings
let _themeStyleTag = ''
let _themeExpiry   = 0

async function fetchThemeStyleTag(): Promise<string> {
  if (_themeStyleTag && Date.now() < _themeExpiry) return _themeStyleTag
  if (!storeApiBase) return ''
  try {
    const r = await fetch(`${storeApiBase}/store/settings`)
    if (!r.ok) return ''
    const raw = unwrap(await r.json()) as Record<string, string>
    const bg     = raw.theme_bg     || '#FDF8F0'
    const brand  = raw.theme_brand  || '#C4873A'
    const accent = raw.theme_accent || '#3D2B20'
    const light  = raw.theme_light  || '#F5EDE0'
    const text   = raw.theme_text   || '#1A1008'
    _themeStyleTag = `<style id="lx-theme">${deriveThemeCSS(bg, brand, accent, light, text)}</style>`
    _themeExpiry   = Date.now() + 5 * 60 * 1000
  } catch {
    return ''
  }
  return _themeStyleTag
}

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-ancestors 'self' https://trustseal.enamad.ir",
}

async function createServer() {
  const app = express()

  // Gzip all responses — critical when CSS is inlined in HTML (105 KB raw → ~20 KB)
  app.use(compression())

  if (isProd) {
    app.use((_req, res, next) => {
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v)
      next()
    })
  }

  if (!isProd) {
    const { createServer: createVite } = await import('vite')
    const vite = await createVite({
      server: { middlewareMode: true },
      appType: 'custom',
    })
    app.use(vite.middlewares)

    app.use('*', async (req, res) => {
      const url = req.originalUrl
      try {
        let template = fs.readFileSync(path.join(root, 'index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
        const { html: appHtml } = await render(url)
        const themeStyleTag = await fetchThemeStyleTag()
        const html = template
          .replace('<!--app-html-->', appHtml)
          .replace('</head>', `${themeStyleTag}</head>`)
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
      } catch (e) {
        vite.ssrFixStacktrace(e as Error)
        console.error(e)
        res.status(500).end((e as Error).message)
      }
    })
  } else {
    const clientDir = path.join(root, 'dist', 'client')

    app.use(
      '/assets',
      express.static(path.join(clientDir, 'assets'), {
        maxAge: '1y',
        immutable: true,
      }),
    )
    app.use(express.static(clientDir, { index: false }))

    // Scan assets dir once at startup: map lazy page component name → chunk URL.
    // Keyed by the component name prefix (e.g. "ProductPage") so we can look up
    // the hash-suffixed filename without knowing the hash at build time.
    const routeChunksByName = new Map<string, string>()
    try {
      for (const file of fs.readdirSync(path.join(clientDir, 'assets'))) {
        const m = file.match(/^([A-Z][A-Za-z]+)-[A-Za-z0-9_-]+\.js$/)
        if (m) routeChunksByName.set(m[1], `/assets/${file}`)
      }
    } catch { /* non-fatal */ }

    // Route pattern → chunk component name (must match keys above)
    const ROUTE_CHUNKS: Array<[RegExp, string]> = [
      [/^\/product\//, 'ProductPage'],
      [/^\/collections\/[^/?#]+/, 'CollectionDetailPage'],
      [/^\/collections/, 'CollectionsPage'],
      [/^\/category\//, 'CategoryPage'],
      [/^\/checkout/, 'CheckoutPage'],
      [/^\/wishlist/, 'WishlistPage'],
      [/^\/account/, 'AccountPage'],
      [/^\/search/, 'SearchResultsPage'],
      [/^\/blog\/[^/?#]+/, 'BlogDetailPage'],
      [/^\/blog/, 'BlogListPage'],
      [/^\/about/, 'AboutPage'],
      [/^\/faq/, 'FaqPage'],
      [/^\/shipping/, 'ShippingPage'],
      [/^\/privacy/, 'PrivacyPage'],
      [/^\/terms/, 'TermsPage'],
      [/^\/contact/, 'ContactPage'],
    ]

    const entryUrl = pathToFileURL(
      path.join(root, 'dist', 'server', 'entry-server.js'),
    ).href
    const { render } = await import(entryUrl)
    let template = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf-8')

    const cssHref = template.match(/href="(\/assets\/[^"]+\.css)"/)?.[1] ?? null
    const cssPreloadLink = cssHref ? `<${cssHref}>; rel=preload; as=style; crossorigin` : null

    // Inline the full CSS to eliminate the render-blocking request.
    // The blocking <link rel="stylesheet"> is replaced with a <style> tag injected
    // per-response so the browser can render as soon as the HTML arrives.
    // With gzip (compression middleware), the combined HTML+CSS is ~20 KB — the
    // same as the CSS transfer alone — so inline costs nothing in extra bytes.
    let inlineCssTag = ''
    if (cssHref) {
      try {
        const cssContent = fs.readFileSync(path.join(clientDir, cssHref), 'utf-8')
        inlineCssTag = `<style>${cssContent}</style>`
        // Strip the blocking <link> so the browser never sees a stylesheet request
        template = template.replace(/<link rel="stylesheet"[^>]+>/g, '')
      } catch { /* non-fatal — blocking link stays in template */ }
    }

    app.use('*', async (req, res) => {
      const url = req.originalUrl
      try {
        // Pre-fetch route data so SSR renders the full layout (no spinner),
        // eliminating CLS and the LCP resource-load delay on every page.
        let initialData: Record<string, unknown> = {}
        let lcpPreloadTag = ''
        let initialScript = ''
        let footerScript = ''

        const pathOnly = url.split('?')[0]

        // Preload the lazy JS chunk for the current route so React's hydrateRoot
        // never shows the Suspense fallback (PageLoader, min-h-60vh) while the
        // module downloads — that flash is what shifts the footer by ~30% vh.
        let routePreloadTag = ''
        for (const [pattern, name] of ROUTE_CHUNKS) {
          if (pattern.test(pathOnly)) {
            const chunkHref = routeChunksByName.get(name)
            if (chunkHref) routePreloadTag = `<link rel="modulepreload" crossorigin href="${chunkHref}">`
            break
          }
        }
        const isHomePage      = pathOnly === '/' || pathOnly === ''
        const productMatch    = pathOnly.match(/^\/product\/([^/?#]+)$/)
        const collDetailMatch = pathOnly.match(/^\/collections\/([^/?#]+)$/)
        const collListMatch   = !collDetailMatch && /^\/collections\/?$/.test(pathOnly)
        const categoryMatch   = pathOnly.match(/^\/category\/([^/?#]+)$/)
        const blogPostMatch   = pathOnly.match(/^\/blog\/([^/?#]+)$/)
        const isBlogList      = pathOnly === '/blog' || pathOnly === '/blog/'

        try {
          if (storeApiBase && isHomePage) {
            // ── / (home) — prefetch banners for hero LCP ──────────────────
            const r = await fetch(`${storeApiBase}/store/banners`)
            if (r.ok) {
              const data = unwrap(await r.json())
              const banners = Array.isArray(data) ? data : []
              if (banners.length > 0) {
                initialData = { banners }
                initialScript = `<script>window.__BANNERS_INITIAL__=${safeJson(banners)}</script>`
                const firstImg: string | undefined =
                  banners[0]?.image_url || banners[0]?.product?.image_url
                if (firstImg) {
                  lcpPreloadTag = `<link rel="preload" as="image" href="${firstImg}" fetchpriority="high">`
                }
              }
            }

          } else if (productApiBase && productMatch) {
            // ── /product/:id ──────────────────────────────────────────────
            const r = await fetch(`${productApiBase}/products/${productMatch[1]}`)
            if (r.ok) {
              const data = unwrap(await r.json())
              initialData = { product: data }
              initialScript = `<script>window.__PRODUCT_INITIAL__=${safeJson(data)}</script>`
              const imgs = (data as { images?: Array<{ url: string }> })?.images
              const lcpUrl = imgs && imgs.length > 1 ? imgs[1].url : imgs?.[0]?.url
              if (lcpUrl) lcpPreloadTag = `<link rel="preload" as="image" href="${lcpUrl}" fetchpriority="high">`
            }

          } else if (productApiBase && collDetailMatch) {
            // ── /collections/:slug ────────────────────────────────────────
            const r = await fetch(`${productApiBase}/collections/${collDetailMatch[1]}`)
            if (r.ok) {
              const data = unwrap(await r.json())
              initialData = { collection: data }
              initialScript = `<script>window.__COLLECTION_INITIAL__=${safeJson(data)}</script>`
              const cover = (data as { cover_image_url?: string })?.cover_image_url
              if (cover) lcpPreloadTag = `<link rel="preload" as="image" href="${cover}" fetchpriority="high">`
            }

          } else if (productApiBase && collListMatch) {
            // ── /collections ──────────────────────────────────────────────
            const r = await fetch(`${productApiBase}/collections`)
            if (r.ok) {
              const raw = unwrap(await r.json())
              const items = (raw as { items?: unknown[] })?.items ?? (Array.isArray(raw) ? raw : [])
              initialData = { collections: items }
              initialScript = `<script>window.__COLLECTIONS_INITIAL__=${safeJson(items)}</script>`
            }

          } else if (storeApiBase && blogPostMatch) {
            // ── /blog/:slug ────────────────────────────────────────────────
            const r = await fetch(`${storeApiBase}/store/blog/${encodeURIComponent(blogPostMatch[1])}`)
            if (r.ok) {
              const data = unwrap(await r.json())
              initialData = { blogPost: data }
              initialScript = `<script>window.__BLOG_POST_INITIAL__=${safeJson(data)}</script>`
              const img = (data as { featured_image_url?: string })?.featured_image_url
              if (img) lcpPreloadTag = `<link rel="preload" as="image" href="${img}" fetchpriority="high">`
            }

          } else if (storeApiBase && isBlogList) {
            // ── /blog ──────────────────────────────────────────────────────
            const r = await fetch(`${storeApiBase}/store/blog?page=1&page_size=12`)
            if (r.ok) {
              const data = unwrap(await r.json())
              initialData = { blogList: data }
              initialScript = `<script>window.__BLOG_LIST_INITIAL__=${safeJson(data)}</script>`
            }

          } else if (productApiBase && categoryMatch) {
            // ── /category/:id ─────────────────────────────────────────────
            const slug = categoryMatch[1]
            let apiCategoryId: string | undefined
            if (slug !== 'new') {
              const cats = await fetchCategories(productApiBase)
              const local = CATEGORIES.find((c) => c.id === slug)
              apiCategoryId = cats.find((c) => c.name === local?.fa)?.id
            }
            const qs = new URLSearchParams({ sort: 'newest', limit: '60' })
            if (apiCategoryId) qs.set('category_id', apiCategoryId)
            const r = await fetch(`${productApiBase}/products?${qs}`)
            if (r.ok) {
              const data = unwrap(await r.json()) as { items?: unknown[]; next_cursor?: string }
              initialData = {
                categoryProducts: data,
                categoryResolvedId: apiCategoryId ?? null,
              }
              initialScript = `<script>window.__CATEGORY_INITIAL__=${safeJson(initialData)}</script>`
            }
          }
          // Footer links — cached in memory, fetched for every route to eliminate CLS
          if (productApiBase) {
            const [footerCats, footerCols] = await Promise.all([
              fetchCategories(productApiBase).catch(() => [] as Array<{ id: string; name: string }>),
              fetchFooterCollections(productApiBase).catch(() => [] as Array<{ id: string; slug: string; name_fa: string }>),
            ])
            if (footerCats.length > 0 || footerCols.length > 0) {
              initialData = { ...initialData, footerCategories: footerCats, footerCollections: footerCols }
              footerScript = `<script>window.__FOOTER_INITIAL__=${safeJson({ categories: footerCats, collections: footerCols })}</script>`
            }
          }
        } catch {
          // Non-fatal – fall back to client-side fetch for this request
        }

        const [{ html: appHtml }, themeStyleTag] = await Promise.all([
          render(url, initialData),
          fetchThemeStyleTag(),
        ])

        // Fallback: if the route-specific logic didn't set a preload (env var missing,
        // API timeout, or banner without a direct image_url), extract the LCP URL from
        // the SSR output itself — guaranteed to match what the browser will request.
        if (!lcpPreloadTag) {
          const imgEl = /<img\b([^>]*\bfetchpriority="high"[^>]*)>/i.exec(appHtml)
          if (imgEl) {
            const srcAttr = /\bsrc="(https:[^"]+)"/.exec(imgEl[1])
            if (srcAttr?.[1]) {
              lcpPreloadTag = `<link rel="preload" as="image" href="${srcAttr[1]}" fetchpriority="high">`
            }
          }
        }

        const html = template
          .replace('<!--app-html-->', appHtml)
          .replace('</head>', `${inlineCssTag}${themeStyleTag}${routePreloadTag}${lcpPreloadTag}${initialScript}${footerScript}</head>`)
        const headers: Record<string, string> = { 'Content-Type': 'text/html' }
        // Keep the Link preload header: CDN edge caches can use it to push the
        // CSS file to the browser's HTTP cache so subsequent navigations are free.
        if (cssPreloadLink) headers['Link'] = cssPreloadLink
        res.status(200).set(headers).send(html)
      } catch (e) {
        console.error(e)
        res.status(500).end((e as Error).message)
      }
    })
  }

  return app
}

createServer().then((app) => {
  app.listen(port, () => {
    console.log(`Server: http://localhost:${port}`)
  })
})
