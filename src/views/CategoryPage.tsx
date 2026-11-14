import { usePageMeta } from '../hooks/usePageMeta'
import { useState, useMemo, useCallback, useEffect, useRef, useDeferredValue, type FC } from 'react'
import { BTN_CLS, BTN_GHOST_CLS } from '../components/ui/Button'
import { CATEGORIES } from '../data/categories'
import { useCartStore } from '../store/cartStore'
import { useBodyLock } from '../hooks/useBodyLock'
import ProductCard from '../components/product/ProductCard'
import PullToRefresh from '../components/shared/PullToRefresh'
import CategoryHero from '../components/category/CategoryHero'
import FilterPanel, { MAX_PRICE } from '../components/category/FilterPanel'
import { toFa, formatNumber } from '../utils/format'
import { isSoldOut, soldOutLast } from '../utils/stock'
import {
  listProducts,
  listCategories,
  listColors,
  adaptProduct,
  type ApiCategory,
  type ApiColor,
  type ApiProduct,
} from '../api/product'
import type { ServerInitialData } from '../context/initialData'
import type { Product } from '../types'
import Icon from '../components/icons/Icon'
import { LayoutGrid, Grid3x3, List, Columns4 } from 'lucide-react'

declare global {
  interface Window {
    __CATEGORY_INITIAL__?: {
      categoryProducts: { items: ApiProduct[]; next_cursor: string }
      categoryResolvedId: string | null
      categoryColors?: ApiColor[]
    }
  }
}

interface CategoryInitial {
  products: Product[]
  nextCursor: string
  resolvedCatId: string | undefined
}

function getInitialCategoryData(
  slug: string | undefined,
  serverCatProducts: unknown,
  serverResolvedId: string | null | undefined,
): CategoryInitial | null {
  if (!slug) return null
  let raw: { items?: ApiProduct[]; next_cursor?: string } | null = null
  let resolvedCatId: string | null | undefined

  // SSR context path
  if (serverCatProducts && typeof serverCatProducts === 'object') {
    raw = serverCatProducts as { items?: ApiProduct[]; next_cursor?: string }
    resolvedCatId = serverResolvedId
  }
  // Client window path
  if (!raw && typeof window !== 'undefined' && window.__CATEGORY_INITIAL__) {
    raw = window.__CATEGORY_INITIAL__.categoryProducts
    resolvedCatId = window.__CATEGORY_INITIAL__.categoryResolvedId
  }
  if (!raw?.items?.length) return null
  return {
    products: raw.items.map((p) => adaptProduct(p)),
    nextCursor: raw.next_cursor ?? '',
    resolvedCatId: resolvedCatId ?? undefined,
  }
}

type SortKey = 'newest' | 'popular' | 'discount' | 'price-asc' | 'price-desc'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'جدیدترین' },
  { key: 'popular', label: 'محبوب‌ترین' },
  { key: 'discount', label: 'بیشترین تخفیف' },
  { key: 'price-asc', label: 'ارزان‌ترین' },
  { key: 'price-desc', label: 'گران‌ترین' },
]

const MAIN_CATS = CATEGORIES.filter((c) => !['new', 'bridal', 'mens'].includes(c.id))

const PER_PAGE = 12

// Stable references — avoids creating new array/object literals on every render
const EMPTY_MATERIALS: string[] = []
const EMPTY_MATERIAL_COUNTS: Record<string, number> = {}
// All counts start at 0 (populated by API in a future pass); hoisted so it's stable
const CAT_PRODUCT_COUNTS = Object.fromEntries(MAIN_CATS.map((c) => [c.id, 0]))

const VIEW_MODES = [
  { mode: 'cols-2', title: '۲ ستون', Icon: LayoutGrid },
  { mode: '', title: '۳ ستون', Icon: Grid3x3 },
  { mode: 'cols-4', title: '۴ ستون', Icon: Columns4 },
  { mode: 'list', title: 'لیست', Icon: List },
] as const

const PRODUCT_SKELETON = (
  <div className="products-grid" aria-busy="true" aria-label="در حال بارگذاری محصولات">
    {Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-square bg-plate rounded-[var(--radius)]" />
        <div className="h-4 bg-plate rounded w-4/5 mt-3.5" />
        <div className="h-4 bg-plate rounded w-2/5 mt-2.5" />
      </div>
    ))}
  </div>
)

const CATEGORY_SEO_TITLES: Record<string, string> = {
  necklaces: 'خرید گردنبند فانتزی زنانه',
  bracelets: 'خرید دستبند فانتزی زنانه',
  rings: 'خرید انگشتر فانتزی زنانه',
  earrings: 'خرید گوشواره فانتزی دخترانه',
  sets: 'خرید ست جواهرات فانتزی زنانه',
  new: 'جدیدترین محصولات جواهرات فانتزی',
  bridal: 'خرید جواهرات عروس و نامزدی فانتزی',
  mens: 'خرید جواهرات مردانه فانتزی',
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  necklaces:
    'گردنبندهای فانتزی لوکسرا — گردنبندهای ظریف و شیک با روکش ماندگار، بدون نیکل، مناسب برای هر مناسبت. ارسال یک‌روزه در تهران.',
  bracelets:
    'دستبندهای فانتزی لوکسرا — دستبندهای زیبا با روکش طلا و نقره، سایزبندی دقیق، بدون نیکل. ارسال سراسر ایران.',
  rings:
    'انگشترهای فانتزی لوکسرا — انگشترهای شیک با طرح‌های متنوع، آلیاژ بدون نیکل، مناسب برای پوست حساس. ارسال یک‌روزه در تهران.',
  earrings:
    'گوشواره‌های فانتزی لوکسرا — گوشواره‌های ظریف تا جسور با روکش ماندگار، بدون نیکل. ارسال یک‌روزه در تهران.',
  sets: 'ست‌های جواهرات لوکسرا — ست‌های هماهنگ گردنبند، دستبند و گوشواره با روکش ماندگار. ارسال سراسر ایران.',
  new: 'جدیدترین جواهرات فانتزی لوکسرا — آخرین طرح‌های گردنبند، انگشتر، دستبند و گوشواره. بروزرسانی روزانه.',
  bridal: 'جواهرات عروس لوکسرا — ست‌های جواهرات عروسی و نامزدی با طراحی خاص و روکش ماندگار.',
  mens: 'جواهرات مردانه لوکسرا — دستبند، انگشتر و گردنبند مردانه با طراحی مدرن و آلیاژ بادوام.',
}

interface CategoryPageProps {
  id: string
  initialData?: ServerInitialData
}

const CategoryPage: FC<CategoryPageProps> = ({ id, initialData }) => {
  const addItem = useCartStore((s) => s.addItem)
  const category = CATEGORIES.find((c) => c.id === id)

  const categoryJsonLd = useMemo(() => {
    if (!category || !id) return undefined
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'خانه', item: 'https://luxera.ir' },
        {
          '@type': 'ListItem',
          position: 2,
          name: category.fa,
          item: `https://luxera.ir/category/${id}`,
        },
      ],
    }
  }, [category, id])

  usePageMeta({
    title: (id && CATEGORY_SEO_TITLES[id]) || category?.fa || 'دسته‌بندی',
    description: id ? CATEGORY_DESCRIPTIONS[id] : undefined,
    canonical: id ? `/category/${id}` : undefined,
    jsonLd: categoryJsonLd,
  })

  const { categoryProducts: serverCatProducts, categoryResolvedId: serverResolvedId } =
    initialData ?? {}
  const [initial] = useState(() => getInitialCategoryData(id, serverCatProducts, serverResolvedId))

  const [allProducts, setAllProducts] = useState<Product[]>(() => initial?.products ?? [])
  const [loading, setLoading] = useState(!initial)
  const [nextCursor, setNextCursor] = useState(() => initial?.nextCursor ?? '')

  const [sort, setSort] = useState<SortKey>('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState('')
  const [page, setPage] = useState(1)

  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(MAX_PRICE)
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([])
  // From SSR when it has them, so the filter's colour section is in the first render.
  const [availableColors, setAvailableColors] = useState<ApiColor[]>(() => {
    const fromServer = (initialData?.categoryColors ??
      (typeof window !== 'undefined' ? window.__CATEGORY_INITIAL__?.categoryColors : undefined)) as
      ApiColor[] | undefined
    return Array.isArray(fromServer) ? fromServer : []
  })
  const [inStockOnly, setInStockOnly] = useState(false)

  // null = not yet resolved; undefined = no category filter (show all / "new")
  const [resolvedCatId, setResolvedCatId] = useState<string | null | undefined>(
    initial ? initial.resolvedCatId : null,
  )

  // Skip the initial resolve + fetch when the server already seeded data for this slug.
  const skipResolveRef = useRef(!!initial)
  const skipFetchRef = useRef(!!initial)

  useBodyLock(filterOpen)

  // Escape closes the filter sheet / sort menu.
  useEffect(() => {
    if (!filterOpen && !sortOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setFilterOpen(false)
      setSortOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filterOpen, sortOpen])

  // "discount" has no server sort: it re-orders the loaded products on the client.
  const apiSort =
    sort === 'price-asc'
      ? 'price_asc'
      : sort === 'price-desc'
        ? 'price_desc'
        : sort === 'popular'
          ? 'most_reviewed'
          : 'newest'

  const fetchProducts = useCallback(
    async (
      apiCategoryId: string | undefined,
      sortValue: string,
      colorIds?: string[],
      afterId?: string,
    ) => {
      // Appending a page keeps the grid on screen so the scroll position doesn't jump.
      if (!afterId) setLoading(true)
      try {
        const { items, nextCursor: nc } = await listProducts({
          categoryId: apiCategoryId,
          sort: sortValue,
          colorIds,
          limit: 60,
          afterId,
        })
        if (afterId) {
          setAllProducts((prev) => [...prev, ...items.map((p) => adaptProduct(p))])
        } else {
          setAllProducts(items.map((p) => adaptProduct(p)))
        }
        setNextCursor(nc)
      } catch {
        setAllProducts([])
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const haveColors = availableColors.length > 0
  useEffect(() => {
    if (haveColors) return
    void listColors()
      .then(setAvailableColors)
      .catch(() => {})
  }, [haveColors])

  // Resolve the API category ID once when the route param changes.
  useEffect(() => {
    if (!id) return
    if (skipResolveRef.current) {
      skipResolveRef.current = false
      return
    }
    const resolve = async () => {
      if (id === 'new') return undefined
      const cats = await listCategories()
      const local = CATEGORIES.find((c) => c.id === id)
      return cats.find((c) => c.name === local?.fa)?.id ?? undefined
    }
    void resolve()
      .then((catId) => {
        setResolvedCatId(catId)
        setPage(1)
      })
      .catch(() => {
        setResolvedCatId(undefined)
        setPage(1)
      })
  }, [id])

  // Re-fetch whenever category, sort, or color filter changes.
  const colorKey = selectedColorIds.join(',')
  useEffect(() => {
    if (resolvedCatId === null) return
    if (skipFetchRef.current) {
      skipFetchRef.current = false
      return
    }
    void fetchProducts(
      resolvedCatId,
      apiSort,
      selectedColorIds.length ? selectedColorIds : undefined,
    )
    // colorKey is a stable primitive derived from selectedColorIds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedCatId, apiSort, colorKey, fetchProducts])

  // Deferred price bounds keep the filter inputs snappy while the grid re-renders lazily
  const deferredPriceMin = useDeferredValue(priceMin)
  const deferredPriceMax = useDeferredValue(priceMax)

  const filtered = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          p.price >= deferredPriceMin &&
          p.price <= deferredPriceMax &&
          !(inStockOnly && isSoldOut(p)),
      ),
    [allProducts, deferredPriceMin, deferredPriceMax, inStockOnly],
  )

  // Whatever the sort, sold-out products go to the end of the loaded list.
  const sorted = useMemo(() => {
    if (sort !== 'discount') return soldOutLast(filtered)
    const pct = (p: Product) => (p.oldPrice && p.oldPrice > p.price ? 1 - p.price / p.oldPrice : 0)
    return soldOutLast([...filtered].sort((a, b) => pct(b) - pct(a)))
  }, [filtered, sort])

  // "Most discount" is sorted on the client, so it needs every product, not just the
  // first server page: keep pulling pages while that sort is on (the catalogue is small).
  useEffect(() => {
    if (sort !== 'discount' || loading || nextCursor === '') return
    const colors = colorKey ? colorKey.split(',') : undefined
    // fetchProducts sets state after its request resolves, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProducts(resolvedCatId ?? undefined, apiSort, colors, nextCursor)
  }, [sort, loading, nextCursor, fetchProducts, resolvedCatId, apiSort, colorKey])

  // `page` counts how many PER_PAGE batches are revealed, so "show more" never leaves the page.
  const shown = Math.min(sorted.length, page * PER_PAGE)
  const paginated = sorted.slice(0, shown)
  const hasMoreLocal = shown < sorted.length

  const toggleColor = useCallback(
    (id: string) =>
      setSelectedColorIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      ),
    [],
  )
  const resetFilters = useCallback(() => {
    setPriceMin(0)
    setPriceMax(MAX_PRICE)
    setSelectedColorIds([])
    setInStockOnly(false)
    setPage(1)
  }, [])

  const handlePriceMin = useCallback((v: number) => {
    setPriceMin(v)
    setPage(1)
  }, [])
  const handlePriceMax = useCallback((v: number) => {
    setPriceMax(v)
    setPage(1)
  }, [])
  const handleToggleColor = useCallback(
    (id: string) => {
      toggleColor(id)
      setPage(1)
    },
    [toggleColor],
  )
  const handleInStock = useCallback((v: boolean) => {
    setInStockOnly(v)
    setPage(1)
  }, [])
  const handleSort = useCallback((key: SortKey) => {
    setSort(key)
    setSortOpen(false)
    setPage(1)
  }, [])

  const appliedChips = useMemo(() => {
    const colorMap = new Map(availableColors.map((c) => [c.id, c.name]))
    return [
      ...selectedColorIds.map((id) => ({
        label: colorMap.get(id) ?? id,
        remove: () => handleToggleColor(id),
      })),
      // One chip for the whole price range, so a single tap clears it.
      ...(priceMin > 0 || priceMax < MAX_PRICE
        ? [
            {
              label:
                priceMin > 0 && priceMax < MAX_PRICE
                  ? `${formatNumber(priceMin)} تا ${formatNumber(priceMax)} تومان`
                  : priceMin > 0
                    ? `از ${formatNumber(priceMin)} تومان`
                    : `تا ${formatNumber(priceMax)} تومان`,
              remove: () => {
                handlePriceMax(MAX_PRICE)
                handlePriceMin(0)
              },
            },
          ]
        : []),
      ...(inStockOnly ? [{ label: 'فقط موجود', remove: () => handleInStock(false) }] : []),
    ]
  }, [
    selectedColorIds,
    availableColors,
    priceMin,
    priceMax,
    inStockOnly,
    handleToggleColor,
    handlePriceMin,
    handlePriceMax,
    handleInStock,
  ])

  const activeColors = selectedColorIds.length ? selectedColorIds : undefined
  const handleRefresh = useCallback(async () => {
    if (id === 'new') {
      await fetchProducts(undefined, apiSort, activeColors)
      return
    }
    const cats = await listCategories().catch(() => [] as ApiCategory[])
    const local = CATEGORIES.find((c) => c.id === id)
    const match = cats.find((c) => c.name === local?.fa)
    await fetchProducts(match?.id, apiSort, activeColors)
  }, [id, apiSort, activeColors, fetchProducts])

  // Coming back from a product (browser back) restores how far the shopper had scrolled.
  const restoreKey = `lx-cat:${id}`
  const restoredRef = useRef(false)
  useEffect(() => {
    const onScroll = () => {
      try {
        sessionStorage.setItem(restoreKey, JSON.stringify({ page, y: window.scrollY }))
      } catch {
        /* storage unavailable */
      }
    }
    let raf = 0
    const throttled = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(onScroll)
    }
    window.addEventListener('scroll', throttled, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', throttled)
    }
  }, [restoreKey, page])

  useEffect(() => {
    if (restoredRef.current || loading || allProducts.length === 0) return
    restoredRef.current = true
    const nav = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined
    if (nav?.type !== 'back_forward') return
    try {
      const saved = JSON.parse(sessionStorage.getItem(restoreKey) ?? 'null') as {
        page: number
        y: number
      } | null
      if (!saved) return
      // Deferred so the extra batches render first, then the saved offset is applied.
      window.setTimeout(() => {
        setPage(Math.max(1, saved.page))
        requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, saved.y)))
      }, 0)
    } catch {
      /* ignore malformed entry */
    }
  }, [loading, allProducts.length, restoreKey])

  if (!category) {
    return (
      <div>
        <p>دسته‌بندی یافت نشد.</p>
        <a href="/" className="text-plum underline underline-offset-2 mt-4 inline-block">
          بازگشت به خانه
        </a>
      </div>
    )
  }
  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? ''

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)]">
        <CategoryHero category={category} catId={id!} catProductCounts={CAT_PRODUCT_COUNTS} />
      </div>

      <section className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)]">
        {/* ── Toolbar: result count · visible sort options · view mode ── */}
        <div className="mt-6 md:mt-8 mb-6 pb-4 border-b border-rule">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="m-0 text-[14px] font-body font-normal text-muted">
              {loading ? (
                'در حال بارگذاری…'
              ) : (
                <>
                  <span className="font-heading font-bold text-[17px] text-ink">
                    {toFa(sorted.length)}
                  </span>{' '}
                  محصول در {category.fa}
                </>
              )}
            </h2>

            <div className="flex-1" />

            {/* Sort — visible options instead of a hidden dropdown (desktop) */}
            <div
              role="radiogroup"
              aria-label="مرتب‌سازی"
              className="flex items-center gap-1 max-[1100px]:hidden"
            >
              <span className="text-[12.5px] text-muted me-1">مرتب‌سازی:</span>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  role="radio"
                  aria-checked={sort === opt.key}
                  onClick={() => handleSort(opt.key)}
                  className={`min-h-11 px-3.5 rounded-full text-[13px] transition-colors duration-150 cursor-pointer ${sort === opt.key ? 'bg-ink text-bg' : 'text-ink-2 hover:bg-bg-2'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* View mode */}
            <div
              role="group"
              aria-label="نحوه‌ی نمایش"
              className="inline-flex gap-0.5 bg-surface ring-1 ring-inset ring-rule rounded-full p-1 max-sm:hidden"
            >
              {VIEW_MODES.map(({ mode, title, Icon: ModeIcon }) => (
                <button
                  key={mode || 'default'}
                  className={`w-9 h-9 rounded-full grid place-items-center cursor-pointer transition-colors duration-150 ${viewMode === mode ? 'bg-ink text-bg' : 'text-muted hover:text-ink'}`}
                  onClick={() => setViewMode(mode)}
                  title={title}
                  aria-label={title}
                  aria-pressed={viewMode === mode}
                >
                  <ModeIcon size={15} strokeWidth={1.6} />
                </button>
              ))}
            </div>
          </div>

          {/* Applied filter chips */}
          {appliedChips.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto flex-nowrap pt-3 scrollbar-none">
              {appliedChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={chip.remove}
                  aria-label={`حذف فیلتر ${chip.label}`}
                  className="group inline-flex items-center gap-1.5 min-h-[34px] ps-3 pe-2 bg-surface ring-1 ring-inset ring-rule rounded-full text-[12.5px] text-ink-2 shrink-0 cursor-pointer hover:ring-ink"
                >
                  {chip.label}
                  <span className="w-5 h-5 rounded-full grid place-items-center text-muted group-hover:bg-ink group-hover:text-bg transition-colors">
                    <Icon name="x" size={10} />
                  </span>
                </button>
              ))}
              <button
                className="min-h-[34px] text-[12.5px] text-plum px-2 cursor-pointer shrink-0 hover:text-ink"
                onClick={resetFilters}
              >
                پاک کردن همه
              </button>
            </div>
          )}
        </div>

        {/* ── Grid: filter sidebar + product section ───────────────── */}
        <div className="grid grid-cols-[272px_1fr] gap-10 pb-[88px] max-[1100px]:grid-cols-1 max-[1100px]:pb-[120px] max-[720px]:pb-[200px]">
          <FilterPanel
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
            priceMin={priceMin}
            priceMax={priceMax}
            materials={EMPTY_MATERIALS}
            selectedColorIds={selectedColorIds}
            inStockOnly={inStockOnly}
            availableMaterials={EMPTY_MATERIALS}
            materialCounts={EMPTY_MATERIAL_COUNTS}
            availableColors={availableColors}
            onPriceMinChange={handlePriceMin}
            onPriceMaxChange={handlePriceMax}
            onToggleMaterial={() => {}}
            onToggleColor={handleToggleColor}
            onInStockChange={handleInStock}
            onReset={resetFilters}
            resultCount={sorted.length}
          />

          <section>
            {loading ? (
              PRODUCT_SKELETON
            ) : paginated.length > 0 ? (
              <div className={`products-grid${viewMode ? ` ${viewMode}` : ''}`}>
                {paginated.map((p, i) => (
                  <ProductCard key={p.id} product={p} onAdd={addItem} priority={i < 4} />
                ))}
              </div>
            ) : (
              <div className="mt-12 p-8 bg-surface rounded-[var(--radius)] grid grid-cols-[auto_1fr_auto] gap-6 items-center border border-rule max-sm:grid-cols-1 max-sm:text-center max-sm:p-6">
                <span className="w-16 h-16 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 max-sm:mx-auto">
                  <Icon name="search" size={30} strokeWidth={1.4} />
                </span>
                <div>
                  <h2 className="font-heading text-[18px] font-semibold m-0 mb-1">
                    محصولی با این فیلترها یافت نشد
                  </h2>
                  <p className="m-0 text-muted text-[13px]">
                    فیلترها را آزادتر کنید یا همه را پاک کنید.
                  </p>
                </div>
                <button className={BTN_CLS} onClick={resetFilters} style={{ padding: '11px 18px' }}>
                  پاک کردن فیلترها
                </button>
              </div>
            )}

            {/* Show more: reveals the next batch, then pulls the next server page when needed */}
            {!loading && (hasMoreLocal || nextCursor !== '') && (
              <div className="mt-12 pt-6 border-t border-rule flex flex-col items-center gap-3">
                <span className="text-[13px] text-muted" aria-live="polite">
                  {toFa(shown)} از {toFa(sorted.length)}
                  {nextCursor !== '' && !hasMoreLocal ? '+' : ''} محصول
                </span>
                <div
                  className="w-[200px] h-1 rounded-full bg-plate overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className="h-full bg-copper"
                    style={{ width: `${Math.round((shown / Math.max(1, sorted.length)) * 100)}%` }}
                  />
                </div>
                <button
                  className={BTN_GHOST_CLS}
                  onClick={() => {
                    if (hasMoreLocal) setPage((p) => p + 1)
                    else
                      void fetchProducts(
                        resolvedCatId ?? undefined,
                        apiSort,
                        activeColors,
                        nextCursor,
                      ).then(() => setPage((p) => p + 1))
                  }}
                >
                  نمایش بیشتر
                </button>
              </div>
            )}
          </section>
        </div>
      </section>

      {/* ── Mobile sticky action bar ─────────────────────────────── */}
      <div
        className={`hidden max-[1100px]:flex fixed bottom-0 inset-x-0 z-[110] bg-bg/95 backdrop-blur-[10px] border-t border-rule px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] gap-2 transition-transform duration-300 ${filterOpen ? 'translate-y-full pointer-events-none' : ''}`}
      >
        {/* Filter button */}
        <button
          onClick={() => setFilterOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] bg-ink text-bg rounded-full text-[13.5px] font-body cursor-pointer transition-opacity duration-150 active:opacity-80"
        >
          <Icon name="sliders" size={14} />
          فیلترها
          {appliedChips.length > 0 && (
            <span className="min-w-5 h-5 px-1 rounded-full bg-plum text-bg text-[12px] grid place-items-center flex-shrink-0">
              {toFa(appliedChips.length)}
            </span>
          )}
        </button>

        {/* Sort button + dropdown */}
        <div className="flex-1 relative">
          <button
            onClick={() => setSortOpen((o) => !o)}
            className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] bg-surface border border-rule rounded-full text-[13.5px] font-body cursor-pointer transition-[border-color] duration-150 hover:border-ink active:border-ink"
          >
            <span className="text-muted text-[13px]">ترتیب:</span>
            <span>{currentSortLabel}</span>
            <Icon
              name="chevron-down"
              size={12}
              className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {sortOpen && (
            <div className="absolute bottom-[calc(100%+6px)] inset-x-0 bg-surface border border-rule rounded-[var(--radius)] overflow-hidden shadow-[var(--shadow-lift)] z-20">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  className={`flex items-center w-full px-4 py-3.5 text-[13px] text-right transition-colors duration-150 hover:bg-plate ${sort === opt.key ? 'text-plum font-medium' : 'text-ink-2'}`}
                  onClick={() => handleSort(opt.key)}
                >
                  {opt.label}
                  {sort === opt.key && <Icon name="check" size={14} className="me-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  )
}

export default CategoryPage
