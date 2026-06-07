import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import express, { type Request, type Response } from 'express'
import compression from 'compression'
import { CATEGORIES } from './src/data/categories'
import { deriveThemeCSS } from './src/utils/themeTokens'

const SITE_URL = 'https://luxera.ir'
const BASE_TITLE = 'Luxera · لوکسرا'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

interface PageMeta {
  title: string
  description: string
  canonical: string
  ogImage?: string
}

const DEFAULT_DESCRIPTION = 'لوکسرا — فروشگاه اینترنتی جواهرات فانتزی دست‌ساز. گردنبند، انگشتر، دستبند و گوشواره با روکش ماندگار، بدون نیکل، با ارسال یک‌روزه در تهران.'

const STATIC_PAGE_META: Record<string, { title: string; description?: string }> = {
  '/collections': { title: `مجموعه‌ها | ${BASE_TITLE}`, description: 'مجموعه‌های اختصاصی جواهرات فانتزی لوکسرا — ست‌های طراحی‌شده برای هر سبک و مناسبت.' },
  '/blog':        { title: `بلاگ | ${BASE_TITLE}`, description: 'مقالات و راهنماهای لوکسرا درباره جواهرات فانتزی، مراقبت از زیورآلات و ترندهای مد.' },
  '/about':       { title: `درباره‌ی ما | ${BASE_TITLE}`, description: 'داستان لوکسرا — فروشگاه تخصصی جواهرات فانتزی ایران با تمرکز بر کیفیت، طراحی اصیل و ارسال سریع.' },
  '/faq':         { title: `پرسش‌های متداول | ${BASE_TITLE}`, description: 'پاسخ سوالات رایج درباره خرید، ارسال، کیفیت محصولات و شرایط بازگشت در فروشگاه لوکسرا.' },
  '/shipping':    { title: `ارسال و تحویل | ${BASE_TITLE}`, description: 'جزئیات ارسال لوکسرا — تحویل یک‌روزه در تهران، ۲ تا ۴ روز کاری در سراسر ایران، همه سفارش‌ها بیمه‌دار.' },
  '/contact':     { title: `تماس با ما | ${BASE_TITLE}`, description: 'با تیم پشتیبانی لوکسرا از طریق واتس‌اپ، تلگرام یا فرم تماس در ارتباط باشید.' },
  '/privacy':     { title: `حریم خصوصی | ${BASE_TITLE}`, description: 'سیاست حفظ حریم خصوصی لوکسرا — نحوه جمع‌آوری، استفاده و حفاظت از اطلاعات شما.' },
  '/terms':       { title: `شرایط استفاده | ${BASE_TITLE}`, description: 'شرایط و ضوابط استفاده از فروشگاه لوکسرا — قوانین خرید، بازگشت کالا و مسئولیت‌ها.' },
}

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.webp`

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  necklaces: 'گردنبندهای فانتزی لوکسرا — گردنبندهای ظریف و شیک با روکش ماندگار، بدون نیکل، مناسب برای هر مناسبت. ارسال یک‌روزه در تهران.',
  bracelets: 'دستبندهای فانتزی لوکسرا — دستبندهای زیبا با روکش طلا و نقره، سایزبندی دقیق، بدون نیکل. ارسال سراسر ایران.',
  rings:     'انگشترهای فانتزی لوکسرا — انگشترهای شیک با طرح‌های متنوع، آلیاژ بدون نیکل، مناسب برای پوست حساس. ارسال یک‌روزه در تهران.',
  earrings:  'گوشواره‌های فانتزی لوکسرا — گوشواره‌های ظریف تا جسور با روکش ماندگار، بدون نیکل. ارسال یک‌روزه در تهران.',
  sets:      'ست‌های جواهرات لوکسرا — ست‌های هماهنگ گردنبند، دستبند و گوشواره با روکش ماندگار. ارسال سراسر ایران.',
  new:       'جدیدترین جواهرات فانتزی لوکسرا — آخرین طرح‌های گردنبند، انگشتر، دستبند و گوشواره. بروزرسانی روزانه.',
  bridal:    'جواهرات عروس لوکسرا — ست‌های جواهرات عروسی و نامزدی با طراحی خاص و روکش ماندگار.',
  mens:      'جواهرات مردانه لوکسرا — دستبند، انگشتر و گردنبند مردانه با طراحی مدرن و آلیاژ بادوام.',
}

function buildPageMeta(pathOnly: string, initialData: Record<string, unknown>): PageMeta {
  const canonical = pathOnly === '/' || pathOnly === '' ? `${SITE_URL}/` : `${SITE_URL}${pathOnly}`

  // /product/:id
  const productMatch = pathOnly.match(/^\/product\/([^/?#]+)$/)
  if (productMatch && initialData.product) {
    const p = initialData.product as { seo_title?: string; title_fa?: string; title?: string; seo_description?: string; short_description?: string; images?: Array<{ url: string }> }
    const name = p.seo_title || p.title_fa || p.title || 'محصول'
    const ogImage = p.images?.[0]?.url || DEFAULT_OG_IMAGE
    return { title: `${name} | ${BASE_TITLE}`, description: p.seo_description || p.short_description || DEFAULT_DESCRIPTION, canonical, ogImage }
  }

  // /blog/:slug
  const blogPostMatch = pathOnly.match(/^\/blog\/([^/?#]+)$/)
  if (blogPostMatch && initialData.blogPost) {
    const post = initialData.blogPost as { seo_title?: string; title?: string; seo_description?: string; excerpt?: string; featured_image_url?: string }
    const name = post.seo_title || post.title || 'مقاله'
    const ogImage = post.featured_image_url || DEFAULT_OG_IMAGE
    return { title: `${name} | ${BASE_TITLE}`, description: post.seo_description || post.excerpt || DEFAULT_DESCRIPTION, canonical, ogImage }
  }

  // /collections/:slug
  const collDetailMatch = pathOnly.match(/^\/collections\/([^/?#]+)$/)
  if (collDetailMatch && initialData.collection) {
    const col = initialData.collection as { name_fa?: string; description?: string; cover_image_url?: string }
    const ogImage = col.cover_image_url || DEFAULT_OG_IMAGE
    return { title: `${col.name_fa || 'مجموعه'} | ${BASE_TITLE}`, description: col.description || DEFAULT_DESCRIPTION, canonical, ogImage }
  }

  // /category/:id
  const categoryMatch = pathOnly.match(/^\/category\/([^/?#]+)$/)
  if (categoryMatch) {
    const cat = CATEGORIES.find((c) => c.id === categoryMatch[1])
    const description = CATEGORY_DESCRIPTIONS[categoryMatch[1]] || DEFAULT_DESCRIPTION
    return { title: `${cat?.fa || 'دسته‌بندی'} | ${BASE_TITLE}`, description, canonical }
  }

  // Static routes with known meta
  const staticNorm = pathOnly.replace(/\/$/, '') || '/'
  const staticMeta = STATIC_PAGE_META[staticNorm]
  if (staticMeta) return { title: staticMeta.title, description: staticMeta.description || DEFAULT_DESCRIPTION, canonical }

  // Homepage / fallback
  return { title: `${BASE_TITLE} — جواهرات فانتزی دست‌ساز`, description: DEFAULT_DESCRIPTION, canonical }
}

function injectPageMeta(html: string, meta: PageMeta): string {
  let result = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/,  `$1${escapeHtml(meta.description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/,        `$1${escapeHtml(meta.canonical)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/,       `$1${escapeHtml(meta.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/,  `$1${escapeHtml(meta.description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/,          `$1${escapeHtml(meta.canonical)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/,       `$1${escapeHtml(meta.title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/,  `$1${escapeHtml(meta.description)}$2`)
  if (meta.ogImage) {
    result = result
      .replace(/(<meta property="og:image" content=")[^"]*(")/,  `$1${escapeHtml(meta.ogImage)}$2`)
      .replace(/(<meta name="twitter:image" content=")[^"]*(")/,  `$1${escapeHtml(meta.ogImage)}$2`)
  }
  return result
}

// Dynamic sitemap — cached 1h to avoid hammering the API on every crawler visit
let _sitemapCache = ''
let _sitemapExpiry = 0

async function generateSitemapXml(productApiBase: string, storeApiBase: string): Promise<string> {
  if (_sitemapCache && Date.now() < _sitemapExpiry) return _sitemapCache

  const today = new Date().toISOString().split('T')[0]

  function url(loc: string, priority: string, changefreq: string, lastmod = today): string {
    return `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  }

  const parts: string[] = [
    url('/',             '1.0', 'daily'),
    url('/collections',  '0.9', 'weekly'),
    url('/category/necklaces', '0.8', 'daily'),
    url('/category/bracelets', '0.8', 'daily'),
    url('/category/rings',     '0.8', 'daily'),
    url('/category/earrings',  '0.8', 'daily'),
    url('/category/sets',      '0.8', 'daily'),
    url('/blog',     '0.7', 'weekly'),
    url('/about',    '0.6', 'monthly'),
    url('/contact',  '0.6', 'monthly'),
    url('/faq',      '0.5', 'monthly'),
    url('/shipping', '0.5', 'monthly'),
    url('/privacy',  '0.3', 'yearly'),
    url('/terms',    '0.3', 'yearly'),
  ]

  // Products (cursor-paginated)
  if (productApiBase) {
    try {
      let cursor = ''
      let hasMore = true
      while (hasMore) {
        const qs = new URLSearchParams({ limit: '500', sort: 'newest' })
        if (cursor) qs.set('after_id', cursor)
        const r = await fetch(`${productApiBase}/products?${qs}`)
        if (!r.ok) break
        const data = unwrap(await r.json()) as { items?: Array<{ slug?: string; id: string; updated_at?: string }>; next_cursor?: string }
        for (const p of data.items ?? []) {
          const slug = p.slug ?? p.id
          const lastmod = p.updated_at?.split('T')[0] ?? today
          parts.push(url(`/product/${slug}`, '0.7', 'weekly', lastmod))
        }
        cursor = data.next_cursor ?? ''
        hasMore = !!cursor && (data.items?.length ?? 0) > 0
      }
    } catch { /* non-fatal */ }
  }

  // Collections
  if (productApiBase) {
    try {
      const r = await fetch(`${productApiBase}/collections`)
      if (r.ok) {
        const data = unwrap(await r.json()) as { items?: Array<{ slug: string; created_at?: string }> }
        for (const c of data.items ?? []) {
          parts.push(url(`/collections/${c.slug}`, '0.8', 'weekly', c.created_at?.split('T')[0] ?? today))
        }
      }
    } catch { /* non-fatal */ }
  }

  // Blog posts (page-paginated, max 50/page)
  if (storeApiBase) {
    try {
      let page = 1
      let hasMore = true
      while (hasMore) {
        const r = await fetch(`${storeApiBase}/store/blog?page=${page}&page_size=50`)
        if (!r.ok) break
        const data = unwrap(await r.json()) as { posts?: Array<{ slug: string; updated_at?: string; published_at?: string | null }> }
        const posts = data.posts ?? []
        for (const p of posts) {
          const lastmod = (p.updated_at ?? p.published_at ?? today).split('T')[0]
          parts.push(url(`/blog/${p.slug}`, '0.6', 'monthly', lastmod))
        }
        hasMore = posts.length === 50
        page++
      }
    } catch { /* non-fatal */ }
  }

  _sitemapCache = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${parts.join('\n')}\n</urlset>`
  _sitemapExpiry = Date.now() + 60 * 60 * 1000
  return _sitemapCache
}

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

  // Dynamic sitemap — registered before static middleware so it wins in prod
  app.get('/sitemap.xml', async (_req: Request, res: Response) => {
    try {
      const xml = await generateSitemapXml(productApiBase, storeApiBase)
      res.set({ 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }).send(xml)
    } catch (e) {
      res.status(500).end((e as Error).message)
    }
  })

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
        const pathOnly = url.split('?')[0]
        const pageMeta = buildPageMeta(pathOnly, {})
        let html = injectPageMeta(template, pageMeta)
        html = html
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

        const pageMeta = buildPageMeta(pathOnly, initialData)
        let html = injectPageMeta(template, pageMeta)
        html = html
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
