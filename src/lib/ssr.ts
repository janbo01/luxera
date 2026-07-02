/**
 * Server-side utilities shared across Astro pages.
 * Handles theme CSS fetching and data pre-fetching from APIs.
 */
import { deriveThemeCSS } from '../utils/themeTokens'
import { CATEGORIES } from '../data/categories'

const SITE_URL = 'https://luxera.ir'

// Use process.env so the Docker-internal hostnames (http://store:8084) are
// read at request time from the container's runtime environment, not baked
// into the bundle. Falls back to the public URL if unset (e.g. local dev).
const storeApiBase =
  (typeof process !== 'undefined' && process.env.STORE_API) ||
  import.meta.env.PUBLIC_STORE_API ||
  ''
const productApiBase =
  (typeof process !== 'undefined' && process.env.PRODUCT_API) ||
  import.meta.env.PUBLIC_PRODUCT_API ||
  ''

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

// ── Theme & Settings ──────────────────────────────────────────────────────────

export interface SocialSettings {
  instagram_url: string
  whatsapp_number: string
  bale_link: string
  ita_link: string
  support_phone: string
  support_landline: string
}

interface RawSettings {
  theme_bg?: string
  theme_brand?: string
  theme_accent?: string
  theme_light?: string
  theme_text?: string
  instagram_url?: string
  whatsapp_number?: string
  bale_link?: string
  ita_link?: string
  support_phone?: string
  support_landline?: string
  [key: string]: string | undefined
}

let _rawSettingsCache: RawSettings | null = null
let _themeCache = ''
let _themeExpiry = 0
let _settingsRefreshInflight: Promise<void> | null = null

async function fetchRawSettings(): Promise<RawSettings> {
  const now = Date.now()
  if (_rawSettingsCache && now < _themeExpiry) return _rawSettingsCache

  if (!storeApiBase) return _rawSettingsCache ?? {}

  // Stale-while-revalidate: serve cached data immediately and refresh in the background
  if (_rawSettingsCache) {
    _themeExpiry = now + 5 * 60 * 1000
    if (!_settingsRefreshInflight) {
      _settingsRefreshInflight = fetch(`${storeApiBase}/store/settings`, {
        signal: AbortSignal.timeout(5000),
      })
        .then(async (r) => {
          if (!r.ok) return
          const raw = unwrap(await r.json()) as RawSettings
          _rawSettingsCache = raw
          _themeCache = ''
          _themeExpiry = Date.now() + 5 * 60 * 1000
        })
        .catch(() => {})
        .finally(() => {
          _settingsRefreshInflight = null
        })
    }
    return _rawSettingsCache
  }

  try {
    const r = await fetch(`${storeApiBase}/store/settings`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!r.ok) return {}
    const raw = unwrap(await r.json()) as RawSettings
    _rawSettingsCache = raw
    _themeExpiry = Date.now() + 5 * 60 * 1000
    return raw
  } catch {
    return {}
  }
}

export async function fetchThemeStyleTag(): Promise<string> {
  if (_themeCache && Date.now() < _themeExpiry) return _themeCache
  const raw = await fetchRawSettings()
  if (!raw || Object.keys(raw).length === 0) return ''
  const bg = raw.theme_bg || '#FDF8F0'
  const brand = raw.theme_brand || '#C4873A'
  const accent = raw.theme_accent || '#3D2B20'
  const light = raw.theme_light || '#F5EDE0'
  const text = raw.theme_text || '#1A1008'
  _themeCache = `<style id="lx-theme">${deriveThemeCSS(bg, brand, accent, light, text)}</style>`
  return _themeCache
}

export async function fetchSocialSettings(): Promise<SocialSettings> {
  const raw = await fetchRawSettings()
  return {
    instagram_url: raw.instagram_url || '',
    whatsapp_number: raw.whatsapp_number || '',
    bale_link: raw.bale_link || '',
    ita_link: raw.ita_link || '',
    support_phone: raw.support_phone || '',
    support_landline: raw.support_landline || '',
  }
}

// Whitelisted (not raw) so we never leak a future non-public settings field into every page.
const SETTINGS_INJECT_KEYS = [
  'store_name',
  'tagline',
  'instagram_url',
  'whatsapp_number',
  'bale_link',
  'ita_link',
  'support_phone',
  'support_landline',
  'theme_bg',
  'theme_brand',
  'theme_accent',
  'theme_light',
  'theme_text',
] as const

export async function fetchSettingsScript(): Promise<string> {
  const raw = await fetchRawSettings()
  if (!raw || Object.keys(raw).length === 0) return ''
  const slim: Record<string, string> = {}
  for (const key of SETTINGS_INJECT_KEYS) {
    slim[key] = raw[key] ?? ''
  }
  return `<script>window.__SETTINGS_INITIAL__=${safeJson(slim)}</script>`
}

// ── Footer data (categories + collections) ────────────────────────────────────

let _catCache: Array<{ id: string; name: string; image_url?: string }> = []
let _catExpiry = 0
let _catInflight: Promise<Array<{ id: string; name: string; image_url?: string }>> | null = null

export async function fetchCategories(): Promise<
  Array<{ id: string; name: string; image_url?: string }>
> {
  if (_catCache.length && Date.now() < _catExpiry) return _catCache
  if (_catInflight) return _catInflight
  if (!productApiBase) return []
  _catInflight = fetch(`${productApiBase}/categories`)
    .then(async (r) => {
      if (!r.ok) return []
      const data =
        (unwrap(await r.json()) as Array<{ id: string; name: string; image_url?: string }>) ?? []
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

let _homeCache: { lcpPreload: string; initialScript: string } | null = null
let _homeExpiry = 0
let _homeRefreshInflight: Promise<void> | null = null

function buildHomeData(banners: unknown[]): { lcpPreload: string; initialScript: string } {
  const first = banners[0] as { image_url?: string; product?: { image_url?: string } } | undefined
  const firstImg = first?.image_url || first?.product?.image_url
  return {
    initialScript: `<script>window.__BANNERS_INITIAL__=${safeJson(banners)}</script>`,
    lcpPreload: firstImg
      ? `<link rel="preload" as="image" href="${firstImg}" fetchpriority="high">`
      : '',
  }
}

export async function fetchHomeData() {
  if (!storeApiBase) return { lcpPreload: '', initialScript: '' }

  const now = Date.now()
  if (_homeCache && now < _homeExpiry) return _homeCache

  // Stale-while-revalidate: serve cached banners immediately, refresh in background.
  // The home banner request was previously uncached and untimed — a slow/cold
  // banners API blocked the entire SSR render (the cause of the ~5.7s home response).
  if (_homeCache) {
    _homeExpiry = now + 5 * 60 * 1000
    if (!_homeRefreshInflight) {
      _homeRefreshInflight = fetch(`${storeApiBase}/store/banners`, {
        signal: AbortSignal.timeout(5000),
      })
        .then(async (r) => {
          if (!r.ok) return
          const data = unwrap(await r.json())
          _homeCache = buildHomeData(Array.isArray(data) ? data : [])
          _homeExpiry = Date.now() + 5 * 60 * 1000
        })
        .catch(() => {})
        .finally(() => {
          _homeRefreshInflight = null
        })
    }
    return _homeCache
  }

  try {
    const r = await fetch(`${storeApiBase}/store/banners`, { signal: AbortSignal.timeout(5000) })
    if (!r.ok) return { lcpPreload: '', initialScript: '' }
    const data = unwrap(await r.json())
    _homeCache = buildHomeData(Array.isArray(data) ? data : [])
    _homeExpiry = Date.now() + 5 * 60 * 1000
    return _homeCache
  } catch {
    return { lcpPreload: '', initialScript: '' }
  }
}

// ── Homepage carousels + categories + blog (client-side previously, moved to SSR
//    to remove them from the post-hydration critical request chain) ─────────────

const HOME_CAROUSEL_SLUGS = ['new', 'necklaces', 'rings', 'earrings', 'bracelets']

interface SlimProduct {
  id: string
  slug?: string
  title: string
  title_fa?: string
  title_en?: string
  price: string
  old_price?: string
  is_new: boolean
  is_sale: boolean
  category_id: string
  image_url?: string
}

function slimProduct(p: Record<string, unknown>): SlimProduct {
  return {
    id: p.id as string,
    slug: p.slug as string | undefined,
    title: p.title as string,
    title_fa: p.title_fa as string | undefined,
    title_en: p.title_en as string | undefined,
    price: p.price as string,
    old_price: p.old_price as string | undefined,
    is_new: !!p.is_new,
    is_sale: !!p.is_sale,
    category_id: p.category_id as string,
    image_url: p.image_url as string | undefined,
  }
}

async function loadHomeLists(): Promise<string> {
  if (!productApiBase && !storeApiBase) return ''

  const cats = await fetchCategories()
  const slugToId = new Map<string, string>()
  for (const slug of HOME_CAROUSEL_SLUGS) {
    if (slug === 'new') continue
    const local = CATEGORIES.find((c) => c.id === slug)
    const apiId = cats.find((c) => c.name === local?.fa)?.id
    if (apiId) slugToId.set(slug, apiId)
  }

  const carouselFetches = productApiBase
    ? HOME_CAROUSEL_SLUGS.filter((slug) => slug === 'new' || slugToId.has(slug)).map(
        async (slug) => {
          const qs = new URLSearchParams({ limit: '10' })
          if (slug !== 'new') qs.set('category_id', slugToId.get(slug)!)
          const r = await fetch(`${productApiBase}/products?${qs}`, {
            signal: AbortSignal.timeout(5000),
          })
          if (!r.ok) return [slug, [] as SlimProduct[]] as const
          const data = unwrap(await r.json()) as { items?: Array<Record<string, unknown>> }
          return [slug, (data.items ?? []).map(slimProduct)] as const
        },
      )
    : []

  const blogFetch = storeApiBase
    ? fetch(`${storeApiBase}/store/blog?page=1&page_size=8`, {
        signal: AbortSignal.timeout(5000),
      })
        .then(async (r) => {
          if (!r.ok) return null
          const data = unwrap(await r.json()) as {
            posts?: Array<Record<string, unknown>>
            total?: number
            page?: number
            page_size?: number
          }
          const posts = (data.posts ?? []).map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            featured_image_url: p.featured_image_url,
            published_at: p.published_at,
          }))
          if (!posts.length) return null
          return {
            posts,
            total: data.total ?? posts.length,
            page: data.page ?? 1,
            page_size: data.page_size ?? 8,
          }
        })
        .catch(() => null)
    : Promise.resolve(null)

  const [carouselResults, blog] = await Promise.all([
    Promise.allSettled(carouselFetches),
    blogFetch,
  ])

  const carousels: Record<string, SlimProduct[]> = {}
  for (const result of carouselResults) {
    if (result.status === 'fulfilled') {
      const [slug, items] = result.value
      if (items.length) carousels[slug] = items
    }
  }

  const categories = cats.length
    ? cats.map((c) => ({ id: c.id, name: c.name, image_url: c.image_url }))
    : undefined

  const hasAny = Object.keys(carousels).length > 0 || !!blog || !!categories
  if (!hasAny) return ''

  const data = {
    categories,
    carousels: Object.keys(carousels).length ? carousels : undefined,
    blog: blog ?? undefined,
  }
  return `<script>window.__HOME_INITIAL__=${safeJson(data)}</script>`
}

let _homeListsCache: string | null = null
let _homeListsExpiry = 0
let _homeListsRefreshInflight: Promise<void> | null = null

export async function fetchHomeListsData(): Promise<{ initialScript: string }> {
  const now = Date.now()
  if (_homeListsCache !== null && now < _homeListsExpiry) {
    return { initialScript: _homeListsCache }
  }

  // Stale-while-revalidate, same posture as fetchHomeData: serve the cached script
  // immediately and refresh in the background so a slow API never blocks SSR.
  if (_homeListsCache !== null) {
    _homeListsExpiry = now + 5 * 60 * 1000
    if (!_homeListsRefreshInflight) {
      _homeListsRefreshInflight = loadHomeLists()
        .then((script) => {
          _homeListsCache = script || '<script>window.__HOME_INITIAL__=null</script>'
          _homeListsExpiry = Date.now() + 5 * 60 * 1000
        })
        .catch(() => {})
        .finally(() => {
          _homeListsRefreshInflight = null
        })
    }
    return { initialScript: _homeListsCache }
  }

  try {
    const script = await loadHomeLists()
    if (!script) {
      // Nothing succeeded — signal explicit null and leave uncached so the next
      // request retries instead of freezing on an empty result.
      return { initialScript: '<script>window.__HOME_INITIAL__=null</script>' }
    }
    _homeListsCache = script
    _homeListsExpiry = Date.now() + 5 * 60 * 1000
    return { initialScript: script }
  } catch {
    return { initialScript: '<script>window.__HOME_INITIAL__=null</script>' }
  }
}

export async function fetchProductData(idOrSlug: string) {
  if (!productApiBase) return { initialData: {}, lcpPreload: '', initialScript: '' }
  try {
    const productRes = await fetch(`${productApiBase}/products/${idOrSlug}`)
    if (!productRes.ok) {
      return { initialData: {}, lcpPreload: '', initialScript: '' }
    }
    const product = unwrap(await productRes.json()) as Record<string, unknown>
    // The comments endpoint only accepts the product UUID (a slug returns 400), so it must
    // be fetched after we've resolved the product — pages are reached by slug. Seeding these
    // server-side lets the SSR JSON-LD include `review` for Google.
    let productComments: unknown[] = []
    const productId = product?.id as string | undefined
    if (productId) {
      try {
        const commentsRes = await fetch(`${productApiBase}/products/${productId}/comments?limit=5`)
        if (commentsRes.ok) {
          const raw = unwrap(await commentsRes.json()) as { items?: unknown[] }
          productComments = raw?.items ?? []
        }
      } catch {
        // Comments are non-critical for the page; ignore fetch failures.
      }
    }
    const imgs = product?.images as Array<{ url: string }> | undefined
    // The gallery renders images[0] as the main image (loading=eager, fetchpriority=high),
    // so that's the LCP element — preload exactly that URL, not images[1].
    const lcpUrl = imgs?.[0]?.url
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

let _blogListCache: unknown = null
let _blogListExpiry = 0
let _blogListRefreshInflight: Promise<void> | null = null

export async function fetchBlogListData(page = 1) {
  if (!storeApiBase) return { initialData: {}, initialScript: '' }

  const now = Date.now()
  if (page === 1 && _blogListCache && now < _blogListExpiry) {
    return {
      initialData: { blogList: _blogListCache },
      initialScript: `<script>window.__BLOG_LIST_INITIAL__=${safeJson(_blogListCache)}</script>`,
    }
  }

  // Stale-while-revalidate for page 1
  if (page === 1 && _blogListCache) {
    _blogListExpiry = now + 2 * 60 * 1000
    if (!_blogListRefreshInflight) {
      _blogListRefreshInflight = fetch(`${storeApiBase}/store/blog?page=1&page_size=12`, {
        signal: AbortSignal.timeout(8000),
      })
        .then(async (r) => {
          if (!r.ok) return
          _blogListCache = unwrap(await r.json())
          _blogListExpiry = Date.now() + 2 * 60 * 1000
        })
        .catch(() => {})
        .finally(() => {
          _blogListRefreshInflight = null
        })
    }
    return {
      initialData: { blogList: _blogListCache },
      initialScript: `<script>window.__BLOG_LIST_INITIAL__=${safeJson(_blogListCache)}</script>`,
    }
  }

  try {
    const r = await fetch(`${storeApiBase}/store/blog?page=${page}&page_size=12`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!r.ok) return { initialData: {}, initialScript: '' }
    const data = unwrap(await r.json())
    if (page === 1) {
      _blogListCache = data
      _blogListExpiry = Date.now() + 2 * 60 * 1000
    }
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
