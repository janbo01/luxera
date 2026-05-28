import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import express from 'express'
import { CATEGORIES } from './src/data/categories'

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

const isProd = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT) || 3000
const root = process.cwd()

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-ancestors 'none'",
}

async function createServer() {
  const app = express()

  app.use((_req, res, next) => {
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v)
    next()
  })

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
        const html = template.replace('<!--app-html-->', appHtml)
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

    const entryUrl = pathToFileURL(
      path.join(root, 'dist', 'server', 'entry-server.js'),
    ).href
    const { render } = await import(entryUrl)
    const template = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf-8')

    // Extract hashed CSS filename from built template for preload header
    const cssHref = template.match(/href="(\/assets\/[^"]+\.css)"/)?.[1] ?? null

    const productApiBase = process.env.VITE_PRODUCT_API ?? ''

    app.use('*', async (req, res) => {
      const url = req.originalUrl
      try {
        // Preload the CSS so the browser fetches it before parsing HTML body
        if (cssHref) {
          res.setHeader('Link', `<${cssHref}>; rel=preload; as=style`)
        }

        // Pre-fetch route data so SSR renders the full layout (no spinner),
        // eliminating CLS and the LCP resource-load delay on every page.
        let initialData: Record<string, unknown> = {}
        let lcpPreloadTag = ''
        let initialScript = ''

        const pathOnly = url.split('?')[0]
        const productMatch    = pathOnly.match(/^\/product\/([^/?#]+)$/)
        const collDetailMatch = pathOnly.match(/^\/collections\/([^/?#]+)$/)
        const collListMatch   = !collDetailMatch && /^\/collections\/?$/.test(pathOnly)
        const categoryMatch   = pathOnly.match(/^\/category\/([^/?#]+)$/)

        try {
          if (productApiBase && productMatch) {
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
        } catch {
          // Non-fatal – fall back to client-side fetch for this request
        }

        const { html: appHtml } = await render(url, initialData)
        const html = template
          .replace('<!--app-html-->', appHtml)
          .replace('</head>', `${lcpPreloadTag}${initialScript}</head>`)
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
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
