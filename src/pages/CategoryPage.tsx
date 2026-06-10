import { usePageMeta } from '../hooks/usePageMeta'
import { useState, useMemo, useCallback, useEffect, useRef, useDeferredValue, type FC } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BTN_CLS, BTN_GHOST_CLS } from '../components/ui/Button'
import { CATEGORIES } from '../data/categories'
import { useCartStore } from '../store/cartStore'
import { useBodyLock } from '../hooks/useBodyLock'
import ProductCard from '../components/product/ProductCard'
import PullToRefresh from '../components/shared/PullToRefresh'
import CategoryHero from '../components/category/CategoryHero'
import FilterPanel, { MAX_PRICE } from '../components/category/FilterPanel'
import { toFa, formatNumber } from '../utils/format'
import { listProducts, listCategories, listColors, adaptProduct, type ApiCategory, type ApiColor, type ApiProduct } from '../api/product'
import { useInitialData } from '../context/initialData'
import type { Product } from '../types'
import Icon from '../components/icons/Icon'
import { LayoutGrid, Grid3x3, List, Columns4 } from 'lucide-react'

declare global {
  interface Window {
    __CATEGORY_INITIAL__?: {
      categoryProducts: { items: ApiProduct[]; next_cursor: string }
      categoryResolvedId: string | null
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

type SortKey = 'newest' | 'price-asc' | 'price-desc'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest',      label: 'جدیدترین' },
  { key: 'price-asc',  label: 'ارزان‌ترین' },
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
  { mode: '',       title: '۳ ستون', Icon: Grid3x3 },
  { mode: 'cols-4', title: '۴ ستون', Icon: Columns4 },
  { mode: 'list',   title: 'لیست',   Icon: List },
] as const

const PRODUCT_SKELETON = (
  <div className="products-grid" style={{ opacity: 0.5 }}>
    {Array.from({ length: 8 }, (_, i) => (
      <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 8, minHeight: 280 }} />
    ))}
  </div>
)

const CATEGORY_SEO_TITLES: Record<string, string> = {
  necklaces: 'خرید گردنبند فانتزی زنانه',
  bracelets: 'خرید دستبند فانتزی زنانه',
  rings:     'خرید انگشتر فانتزی زنانه',
  earrings:  'خرید گوشواره فانتزی دخترانه',
  sets:      'خرید ست جواهرات فانتزی زنانه',
  new:       'جدیدترین محصولات جواهرات فانتزی',
  bridal:    'خرید جواهرات عروس و نامزدی فانتزی',
  mens:      'خرید جواهرات مردانه فانتزی',
}

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

const CategoryPage: FC = () => {
  const addItem = useCartStore((s) => s.addItem)
  const { id } = useParams<{ id: string }>()
  const category = CATEGORIES.find((c) => c.id === id)

  const categoryJsonLd = useMemo(() => {
    if (!category || !id) return undefined
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'خانه', item: 'https://luxera.ir' },
        { '@type': 'ListItem', position: 2, name: category.fa, item: `https://luxera.ir/category/${id}` },
      ],
    }
  }, [category, id])

  usePageMeta({
    title: (id && CATEGORY_SEO_TITLES[id]) || category?.fa || 'دسته‌بندی',
    description: id ? CATEGORY_DESCRIPTIONS[id] : undefined,
    canonical: id ? `/category/${id}` : undefined,
    jsonLd: categoryJsonLd,
  })

  const { categoryProducts: serverCatProducts, categoryResolvedId: serverResolvedId } = useInitialData()
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
  const [availableColors, setAvailableColors] = useState<ApiColor[]>([])
  const [inStockOnly, setInStockOnly] = useState(false)

  // null = not yet resolved; undefined = no category filter (show all / "new")
  const [resolvedCatId, setResolvedCatId] = useState<string | null | undefined>(
    initial ? initial.resolvedCatId : null,
  )

  // Skip the initial resolve + fetch when the server already seeded data for this slug.
  const skipResolveRef = useRef(!!initial)
  const skipFetchRef   = useRef(!!initial)

  useBodyLock(filterOpen)

  const apiSort = sort === 'price-asc' ? 'price_asc' : sort === 'price-desc' ? 'price_desc' : 'newest'

  const fetchProducts = useCallback(async (
    apiCategoryId: string | undefined,
    sortValue: string,
    colorIds?: string[],
    afterId?: string,
  ) => {
    setLoading(true)
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
  }, [])

  useEffect(() => {
    void listColors().then(setAvailableColors).catch(() => {})
  }, [])

  // Resolve the API category ID once when the route param changes.
  useEffect(() => {
    if (!id) return
    if (skipResolveRef.current) { skipResolveRef.current = false; return }
    const resolve = async () => {
      if (id === 'new') return undefined
      const cats = await listCategories()
      const local = CATEGORIES.find((c) => c.id === id)
      return cats.find((c) => c.name === local?.fa)?.id ?? undefined
    }
    void resolve()
      .then((catId) => { setResolvedCatId(catId); setPage(1) })
      .catch(() => { setResolvedCatId(undefined); setPage(1) })
  }, [id])

  // Re-fetch whenever category, sort, or color filter changes.
  const colorKey = selectedColorIds.join(',')
  useEffect(() => {
    if (resolvedCatId === null) return
    if (skipFetchRef.current) { skipFetchRef.current = false; return }
    void fetchProducts(resolvedCatId, apiSort, selectedColorIds.length ? selectedColorIds : undefined)
  // colorKey is a stable primitive derived from selectedColorIds
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedCatId, apiSort, colorKey, fetchProducts])

  // Deferred price bounds keep the filter inputs snappy while the grid re-renders lazily
  const deferredPriceMin = useDeferredValue(priceMin)
  const deferredPriceMax = useDeferredValue(priceMax)

  const filtered = useMemo(
    () => allProducts.filter((p) => p.price >= deferredPriceMin && p.price <= deferredPriceMax),
    [allProducts, deferredPriceMin, deferredPriceMax],
  )

  const sorted = filtered

  const totalPages = Math.ceil(sorted.length / PER_PAGE)
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleColor = useCallback(
    (id: string) => setSelectedColorIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]),
    [],
  )
  const resetFilters = useCallback(() => {
    setPriceMin(0); setPriceMax(MAX_PRICE); setSelectedColorIds([]); setInStockOnly(false); setPage(1)
  }, [])

  const handlePriceMin = useCallback((v: number) => { setPriceMin(v); setPage(1) }, [])
  const handlePriceMax = useCallback((v: number) => { setPriceMax(v); setPage(1) }, [])
  const handleToggleColor = useCallback((id: string) => { toggleColor(id); setPage(1) }, [toggleColor])
  const handleInStock = useCallback((v: boolean) => { setInStockOnly(v); setPage(1) }, [])
  const handleSort = useCallback((key: SortKey) => { setSort(key); setSortOpen(false); setPage(1) }, [])

  const appliedChips = useMemo(() => {
    const colorMap = new Map(availableColors.map((c) => [c.id, c.name]))
    return [
      ...selectedColorIds.map((id) => ({
        label: colorMap.get(id) ?? id,
        remove: () => handleToggleColor(id),
      })),
      ...(priceMin > 0 ? [{ label: `از ${formatNumber(priceMin)}`, remove: () => handlePriceMin(0) }] : []),
      ...(priceMax < MAX_PRICE ? [{ label: `تا ${formatNumber(priceMax)}`, remove: () => handlePriceMax(MAX_PRICE) }] : []),
      ...(inStockOnly ? [{ label: 'فقط موجود', remove: () => handleInStock(false) }] : []),
    ]
  }, [selectedColorIds, availableColors, priceMin, priceMax, inStockOnly, handleToggleColor, handlePriceMin, handlePriceMax, handleInStock])

  const activeColors = selectedColorIds.length ? selectedColorIds : undefined
  const handleRefresh = useCallback(async () => {
    if (id === 'new') { await fetchProducts(undefined, apiSort, activeColors); return }
    const cats = await listCategories().catch(() => [] as ApiCategory[])
    const local = CATEGORIES.find((c) => c.id === id)
    const match = cats.find((c) => c.name === local?.fa)
    await fetchProducts(match?.id, apiSort, activeColors)
  }, [id, apiSort, activeColors, fetchProducts])

  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages])

  if (!category) {
    return (
      <div>
        <p>دسته‌بندی یافت نشد.</p>
        <Link to="/" className="text-plum underline underline-offset-2 mt-4 inline-block">بازگشت به خانه</Link>
      </div>
    )
  }
  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? ''

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)]">
        <CategoryHero
          category={category}
          catId={id!}
          productCount={allProducts.length}
          catProductCounts={CAT_PRODUCT_COUNTS}
        />
      </div>

      <main className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)]">

        {/* ── Toolbar ─────────────────────────────────────────────── */}
        <div className="mt-7 mb-[18px] bg-surface rounded-[var(--radius)] border border-rule">

          {/* Main row */}
          <div className="flex items-center gap-[18px] px-[22px] py-[18px] max-sm:px-4 max-sm:py-3 max-sm:gap-3">
            {/* Product count */}
            <div className="font-heading text-base font-semibold flex items-center gap-2">
              <span>نمایش</span>
              <span className="font-mono text-copper">{loading ? '…' : toFa(paginated.length)}</span>
              <span>از</span>
              <span className="font-mono text-copper">{loading ? '…' : toFa(sorted.length)}</span>
              <span>{category.fa}</span>
            </div>

            <div className="flex-1" />

            {/* View mode — hidden on small mobile */}
            <div className="inline-flex gap-0.5 bg-bg border border-rule rounded-lg p-[3px] max-sm:hidden">
              {VIEW_MODES.map(({ mode, title, Icon: ModeIcon }) => (
                <button
                  key={mode || 'default'}
                  className={`w-[30px] h-[30px] rounded-md grid place-items-center border-none cursor-pointer transition-[background,color] duration-150 ${viewMode === mode ? 'bg-ink text-bg' : 'bg-transparent text-muted'}`}
                  onClick={() => setViewMode(mode)}
                  title={title}
                >
                  <ModeIcon size={14} strokeWidth={1.6} />
                </button>
              ))}
            </div>

            {/* Sort dropdown — hidden on mobile (moved to sticky bottom bar) */}
            <div className="relative max-[1100px]:hidden">
              <button
                className="inline-flex items-center gap-2.5 px-3.5 py-[9px] bg-bg border border-rule rounded-full text-[13px] cursor-pointer font-body transition-[border-color] duration-200 hover:border-ink"
                onClick={() => setSortOpen((o) => !o)}
              >
                <span className="text-muted text-xs">مرتب‌سازی:</span>
                <span>{currentSortLabel}</span>
                <Icon name="chevron-down" size={12} />
              </button>
              {sortOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 min-w-[180px] bg-surface border border-rule rounded-[4px] shadow-[0_8px_24px_rgba(26,15,29,0.1)] z-20 [direction:rtl]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      className={`flex items-center gap-2 w-full px-4 py-3 text-[13px] text-right transition-colors duration-150 hover:bg-plate ${sort === opt.key ? 'text-plum font-normal' : 'text-ink-2'}`}
                      onClick={() => handleSort(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Applied filter chips — own scrollable row, always below the main row */}
          {appliedChips.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto flex-nowrap border-t border-rule px-[22px] pb-3 pt-2.5 max-sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {appliedChips.map((chip, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 py-[5px] pl-1.5 pr-3 bg-bg border border-rule rounded-full text-xs text-ink-2 shrink-0">
                  {chip.label}
                  <button onClick={chip.remove} aria-label="حذف فیلتر" className="w-[18px] h-[18px] rounded-full grid place-items-center bg-transparent text-muted shrink-0 cursor-pointer hover:bg-ink hover:text-bg">
                    <Icon name="x" size={9} />
                  </button>
                </span>
              ))}
              <button className="text-xs text-copper px-2 underline underline-offset-[3px] bg-transparent border-none cursor-pointer shrink-0" onClick={resetFilters}>پاک کردن</button>
            </div>
          )}
        </div>

        {/* ── Grid: filter sidebar + product section ───────────────── */}
        <div className="grid grid-cols-[280px_1fr] gap-8 pb-[88px] max-[1100px]:grid-cols-1 max-[1100px]:pb-[120px] max-[720px]:pb-[200px]">
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
          />

          <section>
            {loading ? PRODUCT_SKELETON : paginated.length > 0 ? (
              <div className={`products-grid${viewMode ? ` ${viewMode}` : ''}`}>
                {paginated.map((p, i) => <ProductCard key={p.id} product={p} onAdd={addItem} priority={i < 4} />)}
              </div>
            ) : (
              <div className="mt-12 p-8 bg-surface rounded-[var(--radius)] grid grid-cols-[auto_1fr_auto] gap-6 items-center border border-rule max-sm:grid-cols-1 max-sm:text-center max-sm:p-6">
                <span className="w-16 h-16 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 max-sm:mx-auto">
                  <Icon name="search" size={30} strokeWidth={1.4} />
                </span>
                <div>
                  <h2 className="font-heading text-[18px] font-semibold m-0 mb-1">محصولی با این فیلترها یافت نشد</h2>
                  <p className="m-0 text-muted text-[13px]">فیلترها را آزادتر کنید یا همه را پاک کنید.</p>
                </div>
                <button className={BTN_CLS} onClick={resetFilters} style={{ padding: '11px 18px' }}>
                  پاک کردن فیلترها
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="mt-9 pt-6 border-t border-rule">
                {/* Mobile: simplified prev / X of Y / next */}
                <div className="flex items-center justify-between sm:hidden">
                  <button
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-rule font-body text-[13px] bg-transparent cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-ink hover:enabled:text-ink text-ink-2"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <Icon name="arrow-right" size={13} />
                    قبلی
                  </button>
                  <span className="font-mono text-[13px] text-muted tabular-nums">
                    {toFa(page)} / {toFa(totalPages)}
                  </span>
                  <button
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-rule font-body text-[13px] bg-transparent cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-ink hover:enabled:text-ink text-ink-2"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    بعدی
                    <Icon name="arrow-left" size={13} />
                  </button>
                </div>

                {/* Desktop: full page number buttons */}
                <div className="hidden sm:flex items-center justify-center gap-1 flex-wrap">
                  <button
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-rule font-body text-[13px] bg-transparent cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-ink hover:enabled:text-ink text-ink-2 me-1"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <Icon name="arrow-right" size={13} />
                    قبلی
                  </button>
                  {pages.map((p) => (
                    <button
                      key={p}
                      className={`w-9 h-9 rounded-full text-[13px] border font-mono cursor-pointer transition-all duration-150 ${p === page ? 'bg-ink text-bg border-ink font-medium' : 'bg-transparent text-ink-2 border-transparent hover:border-rule hover:text-ink'}`}
                      onClick={() => setPage(p)}
                    >
                      {toFa(p)}
                    </button>
                  ))}
                  <button
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-rule font-body text-[13px] bg-transparent cursor-pointer transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-ink hover:enabled:text-ink text-ink-2 ms-1"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    بعدی
                    <Icon name="arrow-left" size={13} />
                  </button>
                </div>
              </div>
            )}

            {!loading && nextCursor !== '' && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  className={BTN_GHOST_CLS}
                  onClick={() => fetchProducts(resolvedCatId ?? undefined, apiSort, activeColors, nextCursor)}
                >
                  بارگذاری بیشتر
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── Mobile sticky action bar ─────────────────────────────── */}
      <div className="hidden max-[1100px]:flex fixed bottom-0 max-[720px]:bottom-[calc(56px+env(safe-area-inset-bottom,0px))] inset-x-0 z-[110] bg-surface/95 backdrop-blur-sm border-t border-rule px-4 pt-3 pb-3">
        {/* Filter button */}
        <button
          onClick={() => setFilterOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-ink text-bg rounded-full text-[13px] font-body cursor-pointer transition-opacity duration-150 active:opacity-80"
        >
          <Icon name="sliders" size={14} />
          فیلترها
          {appliedChips.length > 0 && (
            <span className="w-[18px] h-[18px] rounded-full bg-copper text-bg text-[10px] font-mono grid place-items-center flex-shrink-0">
              {toFa(appliedChips.length)}
            </span>
          )}
        </button>

        <div className="w-px mx-3 bg-rule self-stretch" />

        {/* Sort button + dropdown */}
        <div className="flex-1 relative">
          <button
            onClick={() => setSortOpen((o) => !o)}
            className="w-full inline-flex items-center justify-center gap-2 py-3 border border-rule rounded-full text-[13px] font-body cursor-pointer transition-[border-color] duration-150 hover:border-ink active:border-ink"
          >
            <span className="text-muted text-[11px]">ترتیب:</span>
            <span>{currentSortLabel}</span>
            <Icon name="chevron-down" size={12} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortOpen && (
            <div className="absolute bottom-[calc(100%+6px)] inset-x-0 bg-surface border border-rule rounded-[12px] overflow-hidden shadow-[0_-8px_28px_rgba(26,15,29,0.12)] z-20">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  className={`flex items-center w-full px-4 py-3.5 text-[13px] text-right transition-colors duration-150 hover:bg-plate ${sort === opt.key ? 'text-copper font-medium' : 'text-ink-2'}`}
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
