/**
 * Server-side utilities shared across Astro pages.
 * Handles theme CSS fetching and data pre-fetching from APIs.
 */
import { deriveThemeCSS } from '../utils/themeTokens'
import { CATEGORIES } from '../data/categories'

const SITE_URL = 'https://luxera.ir'

const storeApiBase = import.meta.env.VITE_STORE_API ?? ''
const productApiBase = import.meta.env.VITE_PRODUCT_API ?? ''

// ── Helpers ──────────────────────────────────────────────────────────────────

function unwrap(json: unknown): unknown {
  if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>
    if ('success' in o && 'data' in o) return o.data
  }
  return json
}

export function safeJson(val: unknown): string {
  return JSON.stringify(val).replace(/<\/script>/gi, '<\\/script>')
}

// ── Theme ─────────────────────────────────────────────────────────────────────

let _themeCache = ''
let _themeExpiry = 0

export async function fetchThemeStyleTag(): Promise<string> {
  if (_themeCache && Date.now() < _themeExpiry) return _themeCache
  if (!storeApiBase) return ''
  try {
    const r = await fetch(`${storeApiBase}/store/settings`)
    if (!r.ok) return ''
    const raw = unwrap(await r.json()) as Record<string, string>
    const bg = raw.theme_bg || '#FDF8F0'
    const brand = raw.theme_brand || '#C4873A'
    const accent = raw.theme_accent || '#3D2B20'
    const light = raw.theme_light || '#F5EDE0'
    const text = raw.theme_text || '#1A1008'
    _themeCache = `<style id="lx-theme">${deriveThemeCSS(bg, brand, accent, light, text)}</style>`
    _themeExpiry = Date.now() + 5 * 60 * 1000
  } catch {
    return ''
  }
  return _themeCache
}

// ── Footer data (categories + collections) ────────────────────────────────────

let _catCache: Array<{ id: string; name: string }> = []
let _catExpiry = 0
let _catInflight: Promise<Array<{ id: string; name: string }>> | null = null

export async function fetchCategories(): Promise<Array<{ id: string; name: string }>> {
  if (_catCache.length && Date.now() < _catExpiry) return _catCache
  if (_catInflight) return _catInflight
  if (!productApiBase) return []
  _catInflight = fetch(`${productApiBase}/categories`)
    .then(async (r) => {
      if (!r.ok) return []
      const data = (unwrap(await r.json()) as Array<{ id: string; name: string }>) ?? []
      _catCache = data
      _catExpiry = Date.now() + 15 * 60 * 1000
      return data
    })
    .catch(() => [])
    .finally(() => {
      _catInflight = null
    })
  return _catInflight
}

let _colCache: Array<{ id: string; slug: string; name_fa: string }> = []
let _colExpiry = 0
let _colInflight: Promise<Array<{ id: string; slug: string; name_fa: string }>> | null = null

export async function fetchFooterCollections(): Promise<
  Array<{ id: string; slug: string; name_fa: string }>
> {
  if (_colCache.length && Date.now() < _colExpiry) return _colCache
  if (_colInflight) return _colInflight
  if (!productApiBase) return []
  _colInflight = fetch(`${productApiBase}/collections`)
    .then(async (r) => {
      if (!r.ok) return []
      const raw = unwrap(await r.json()) as {
        items?: Array<{ id: string; slug: string; name_fa: string }>
      }
      const data = raw?.items ?? []
      _colCache = data
      _colExpiry = Date.now() + 15 * 60 * 1000
      return data
    })
    .catch(() => [])
    .finally(() => {
      _colInflight = null
    })
  return _colInflight
}

export interface FooterData {
  categories: Array<{ id: string; name: string }>
  collections: Array<{ id: string; slug: string; name_fa: string }>
}

export async function fetchFooterData(): Promise<FooterData> {
  const [rawCats, collections] = await Promise.all([fetchCategories(), fetchFooterCollections()])
  const categories = rawCats.map((c) => {
    const local = CATEGORIES.find((cat) => cat.fa === c.name)
    return { id: local?.id ?? c.id, name: c.name }
  })
  return { categories, collections }
}

// ── Page-specific data fetchers ───────────────────────────────────────────────

export async function fetchHomeData() {
  if (!storeApiBase) return { lcpPreload: '', initialScript: '' }
  try {
    const r = await fetch(`${storeApiBase}/store/banners`)
    if (!r.ok) return { lcpPreload: '', initialScript: '' }
    const data = unwrap(await r.json())
    const banners = Array.isArray(data) ? data : []
    const firstImg: string | undefined = banners[0]?.image_url || banners[0]?.product?.image_url
    return {
      initialScript: `<script>window.__BANNERS_INITIAL__=${safeJson(banners)}</script>`,
      lcpPreload: firstImg
        ? `<link rel="preload" as="image" href="${firstImg}" fetchpriority="high">`
        : '',
    }
  } catch {
    return { lcpPreload: '', initialScript: '' }
  }
}

export async function fetchProductData(idOrSlug: string) {
  if (!productApiBase) return { initialData: {}, lcpPreload: '', initialScript: '' }
  try {
    const [productRes, commentsRes] = await Promise.allSettled([
      fetch(`${productApiBase}/products/${idOrSlug}`),
      fetch(`${productApiBase}/products/${idOrSlug}/comments?limit=5`),
    ])
    if (productRes.status !== 'fulfilled' || !productRes.value.ok) {
      return { initialData: {}, lcpPreload: '', initialScript: '' }
    }
    const product = unwrap(await productRes.value.json()) as Record<string, unknown>
    let productComments: unknown[] = []
    if (commentsRes.status === 'fulfilled' && commentsRes.value.ok) {
      const raw = unwrap(await commentsRes.value.json()) as { items?: unknown[] }
      productComments = raw?.items ?? []
    }
    const imgs = product?.images as Array<{ url: string }> | undefined
    const lcpUrl = imgs && imgs.length > 1 ? imgs[1].url : imgs?.[0]?.url
    return {
      initialData: { product, productComments },
      initialScript: `<script>window.__PRODUCT_INITIAL__=${safeJson(product)}</script>`,
      lcpPreload: lcpUrl
        ? `<link rel="preload" as="image" href="${lcpUrl}" fetchpriority="high">`
        : '',
    }
  } catch {
    return { initialData: {}, lcpPreload: '', initialScript: '' }
  }
}

export async function fetchCollectionData(slug: string) {
  if (!productApiBase) return { initialData: {}, lcpPreload: '', initialScript: '' }
  try {
    const r = await fetch(`${productApiBase}/collections/${slug}`)
    if (!r.ok) return { initialData: {}, lcpPreload: '', initialScript: '' }
    const data = unwrap(await r.json())
    const cover = (data as { cover_image_url?: string })?.cover_image_url
    return {
      initialData: { collection: data },
      initialScript: `<script>window.__COLLECTION_INITIAL__=${safeJson(data)}</script>`,
      lcpPreload: cover
        ? `<link rel="preload" as="image" href="${cover}" fetchpriority="high">`
        : '',
    }
  } catch {
    return { initialData: {}, lcpPreload: '', initialScript: '' }
  }
}

export async function fetchCollectionsListData() {
  if (!productApiBase) return { initialData: {}, initialScript: '' }
  try {
    const r = await fetch(`${productApiBase}/collections`)
    if (!r.ok) return { initialData: {}, initialScript: '' }
    const raw = unwrap(await r.json())
    const items = (raw as { items?: unknown[] })?.items ?? (Array.isArray(raw) ? raw : [])
    return {
      initialData: { collections: items },
      initialScript: `<script>window.__COLLECTIONS_INITIAL__=${safeJson(items)}</script>`,
    }
  } catch {
    return { initialData: {}, initialScript: '' }
  }
}

export async function fetchBlogPostData(slug: string) {
  if (!storeApiBase) return { initialData: {}, lcpPreload: '', initialScript: '' }
  try {
    const r = await fetch(`${storeApiBase}/store/blog/${encodeURIComponent(slug)}`)
    if (!r.ok) return { initialData: {}, lcpPreload: '', initialScript: '' }
    const data = unwrap(await r.json())
    const img = (data as { featured_image_url?: string })?.featured_image_url
    return {
      initialData: { blogPost: data },
      initialScript: `<script>window.__BLOG_POST_INITIAL__=${safeJson(data)}</script>`,
      lcpPreload: img ? `<link rel="preload" as="image" href="${img}" fetchpriority="high">` : '',
    }
  } catch {
    return { initialData: {}, lcpPreload: '', initialScript: '' }
  }
}

export async function fetchBlogListData(page = 1) {
  if (!storeApiBase) return { initialData: {}, initialScript: '' }
  try {
    const r = await fetch(`${storeApiBase}/store/blog?page=${page}&page_size=12`)
    if (!r.ok) return { initialData: {}, initialScript: '' }
    const data = unwrap(await r.json())
    return {
      initialData: { blogList: data },
      initialScript: `<script>window.__BLOG_LIST_INITIAL__=${safeJson(data)}</script>`,
    }
  } catch {
    return { initialData: {}, initialScript: '' }
  }
}

export async function fetchCategoryData(slug: string) {
  if (!productApiBase) return { initialData: {}, initialScript: '' }
  try {
    let apiCategoryId: string | undefined
    if (slug !== 'new') {
      const cats = await fetchCategories()
      const local = CATEGORIES.find((c) => c.id === slug)
      apiCategoryId = cats.find((c) => c.name === local?.fa)?.id
    }
    const qs = new URLSearchParams({ sort: 'newest', limit: '60' })
    if (apiCategoryId) qs.set('category_id', apiCategoryId)
    const r = await fetch(`${productApiBase}/products?${qs}`)
    if (!r.ok) return { initialData: {}, initialScript: '' }
    const data = unwrap(await r.json()) as { items?: unknown[]; next_cursor?: string }
    const initialData = { categoryProducts: data, categoryResolvedId: apiCategoryId ?? null }
    return {
      initialData,
      initialScript: `<script>window.__CATEGORY_INITIAL__=${safeJson(initialData)}</script>`,
    }
  } catch {
    return { initialData: {}, initialScript: '' }
  }
}

// ── Sitemap generation ────────────────────────────────────────────────────────

let _sitemapCache = ''
let _sitemapExpiry = 0

export async function generateSitemapXml(): Promise<string> {
  if (_sitemapCache && Date.now() < _sitemapExpiry) return _sitemapCache
  const today = new Date().toISOString().split('T')[0]

  function url(loc: string, priority: string, changefreq: string, lastmod = today): string {
    return `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  }

  const parts: string[] = [
    url('/', '1.0', 'daily'),
    url('/collections', '0.9', 'weekly'),
    url('/category/necklaces', '0.8', 'daily'),
    url('/category/bracelets', '0.8', 'daily'),
    url('/category/rings', '0.8', 'daily'),
    url('/category/earrings', '0.8', 'daily'),
    url('/category/sets', '0.8', 'daily'),
    url('/blog', '0.7', 'weekly'),
    url('/about', '0.6', 'monthly'),
    url('/contact', '0.6', 'monthly'),
    url('/faq', '0.5', 'monthly'),
    url('/shipping', '0.5', 'monthly'),
    url('/privacy', '0.3', 'yearly'),
    url('/terms', '0.3', 'yearly'),
  ]

  if (productApiBase) {
    try {
      let cursor = ''
      let hasMore = true
      while (hasMore) {
        const qs = new URLSearchParams({ limit: '500', sort: 'newest' })
        if (cursor) qs.set('after_id', cursor)
        const r = await fetch(`${productApiBase}/products?${qs}`)
        if (!r.ok) break
        const data = unwrap(await r.json()) as {
          items?: Array<{ slug?: string; id: string; updated_at?: string }>
          next_cursor?: string
        }
        for (const p of data.items ?? []) {
          const slug = p.slug ?? p.id
          const lastmod = p.updated_at?.split('T')[0] ?? today
          parts.push(url(`/product/${slug}`, '0.7', 'weekly', lastmod))
        }
        cursor = data.next_cursor ?? ''
        hasMore = !!cursor && (data.items?.length ?? 0) > 0
      }
    } catch {
      /* non-fatal */
    }

    try {
      const r = await fetch(`${productApiBase}/collections`)
      if (r.ok) {
        const data = unwrap(await r.json()) as {
          items?: Array<{ slug: string; created_at?: string }>
        }
        for (const c of data.items ?? []) {
          parts.push(
            url(`/collections/${c.slug}`, '0.8', 'weekly', c.created_at?.split('T')[0] ?? today),
          )
        }
      }
    } catch {
      /* non-fatal */
    }
  }

  if (storeApiBase) {
    try {
      let page = 1
      let hasMore = true
      while (hasMore) {
        const r = await fetch(`${storeApiBase}/store/blog?page=${page}&page_size=50`)
        if (!r.ok) break
        const data = unwrap(await r.json()) as {
          posts?: Array<{ slug: string; updated_at?: string; published_at?: string | null }>
        }
        const posts = data.posts ?? []
        for (const p of posts) {
          const lastmod = (p.updated_at ?? p.published_at ?? today).split('T')[0]
          parts.push(url(`/blog/${p.slug}`, '0.6', 'monthly', lastmod))
        }
        hasMore = posts.length === 50
        page++
      }
    } catch {
      /* non-fatal */
    }
  }

  _sitemapCache = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${parts.join('\n')}\n</urlset>`
  _sitemapExpiry = Date.now() + 60 * 60 * 1000
  return _sitemapCache
}
