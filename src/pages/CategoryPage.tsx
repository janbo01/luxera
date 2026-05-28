import { usePageMeta } from '../hooks/usePageMeta'
import { useState, useMemo, useCallback, useEffect, type FC } from 'react'
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
import { listProducts, listCategories, listColors, adaptProduct, type ApiCategory, type ApiColor } from '../api/product'
import type { Product } from '../types'
import Icon from '../components/icons/Icon'
import { LayoutGrid, Grid3x3, List, Columns4 } from 'lucide-react'

type SortKey = 'newest' | 'price-asc' | 'price-desc'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest',      label: 'جدیدترین' },
  { key: 'price-asc',  label: 'ارزان‌ترین' },
  { key: 'price-desc', label: 'گران‌ترین' },
]

const MAIN_CATS = CATEGORIES.filter((c) => !['new', 'bridal', 'mens'].includes(c.id))

const VIEW_MODES = [
  { mode: 'cols-2', title: '۲ ستون', Icon: LayoutGrid },
  { mode: '',       title: '۳ ستون', Icon: Grid3x3 },
  { mode: 'cols-4', title: '۴ ستون', Icon: Columns4 },
  { mode: 'list',   title: 'لیست',   Icon: List },
] as const

const CategoryPage: FC = () => {
  const addItem = useCartStore((s) => s.addItem)
  const { id } = useParams<{ id: string }>()
  const category = CATEGORIES.find((c) => c.id === id)
  usePageMeta({ title: category?.fa ?? 'دسته‌بندی', canonical: id ? `/category/${id}` : undefined })

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState('')

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

  // null = category not yet resolved; undefined = no specific category (show all)
  const [resolvedCatId, setResolvedCatId] = useState<string | null | undefined>(null)

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

  // Resolve the API category ID once when the route param changes
  useEffect(() => {
    if (!id) return
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

  // Re-fetch whenever category, sort, or color filter changes
  const colorKey = selectedColorIds.join(',')
  useEffect(() => {
    if (resolvedCatId === null) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProducts(resolvedCatId, apiSort, selectedColorIds.length ? selectedColorIds : undefined)
  // colorKey is a stable primitive derived from selectedColorIds
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedCatId, apiSort, colorKey, fetchProducts])

  const filtered = useMemo(
    () => allProducts.filter((p) => {
      if (p.price < priceMin || p.price > priceMax) return false
      return true
    }),
    [allProducts, priceMin, priceMax],
  )

  const sorted = filtered

  const PER_PAGE = 12
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

  const appliedChips = useMemo(() => [
    ...selectedColorIds.map((id) => ({
      label: availableColors.find((c) => c.id === id)?.name ?? id,
      remove: () => handleToggleColor(id),
    })),
    ...(priceMin > 0 ? [{ label: `از ${formatNumber(priceMin)}`, remove: () => handlePriceMin(0) }] : []),
    ...(priceMax < MAX_PRICE ? [{ label: `تا ${formatNumber(priceMax)}`, remove: () => handlePriceMax(MAX_PRICE) }] : []),
    ...(inStockOnly ? [{ label: 'فقط موجود', remove: () => handleInStock(false) }] : []),
  ], [selectedColorIds, availableColors, priceMin, priceMax, inStockOnly, handleToggleColor, handlePriceMin, handlePriceMax, handleInStock])

  const catProductCounts = useMemo(
    () => Object.fromEntries(MAIN_CATS.map((c) => [c.id, 0])),
    [],
  )

  const activeColors = selectedColorIds.length ? selectedColorIds : undefined
  const handleRefresh = useCallback(async () => {
    if (id === 'new') { await fetchProducts(undefined, apiSort, activeColors); return }
    const cats = await listCategories().catch(() => [] as ApiCategory[])
    const local = CATEGORIES.find((c) => c.id === id)
    const match = cats.find((c) => c.name === local?.fa)
    await fetchProducts(match?.id, apiSort, activeColors)
  }, [id, apiSort, activeColors, fetchProducts])

  if (!category) {
    return (
      <div>
        <p>دسته‌بندی یافت نشد.</p>
        <Link to="/" className="text-plum underline underline-offset-2 mt-4 inline-block">بازگشت به خانه</Link>
      </div>
    )
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)]">
        <CategoryHero
          category={category}
          catId={id!}
          productCount={allProducts.length}
          catProductCounts={catProductCounts}
        />
      </div>

      <main className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)]">
        <div className="hidden max-[1100px]:flex items-center gap-2.5 mb-4">
          <button
            onClick={() => setFilterOpen(true)}
            className="px-4 py-2.5 bg-ink text-bg rounded-full text-[13px] border-none cursor-pointer"
          >
            فیلترها · {toFa(sorted.length)} محصول
          </button>
        </div>

        <div className="mt-7 mb-[18px] px-[22px] py-[18px] bg-surface rounded-[var(--radius)] border border-rule flex items-center gap-[18px] flex-wrap max-[640px]:px-4 max-[640px]:py-3.5 max-[640px]:gap-3">
          <div className="font-heading text-base font-semibold flex items-center gap-2">
            <span>نمایش</span>
            <span className="font-mono text-copper">{loading ? '…' : toFa(paginated.length)}</span>
            <span>از</span>
            <span className="font-mono text-copper">{loading ? '…' : toFa(sorted.length)}</span>
            <span>{category.fa}</span>
          </div>

          {appliedChips.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {appliedChips.map((chip, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 py-[5px] pl-1.5 pr-3 bg-bg border border-rule rounded-full text-xs text-ink-2">
                  {chip.label}
                  <button onClick={chip.remove} aria-label="حذف فیلتر" className="w-[18px] h-[18px] rounded-full grid place-items-center bg-transparent text-muted shrink-0 cursor-pointer hover:bg-ink hover:text-bg">
                    <Icon name="x" size={9} />
                  </button>
                </span>
              ))}
              <button className="text-xs text-copper px-2 underline underline-offset-[3px] bg-transparent border-none cursor-pointer" onClick={resetFilters}>پاک کردن</button>
            </div>
          )}

          <div className="flex-1 max-[640px]:hidden" />

          <div className="inline-flex gap-0.5 bg-bg border border-rule rounded-lg p-[3px]">
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

          <div className="relative">
            <button
              className="inline-flex items-center gap-2.5 px-3.5 py-[9px] bg-bg border border-rule rounded-full text-[13px] cursor-pointer font-body transition-[border-color] duration-200 hover:border-ink"
              onClick={() => setSortOpen((o) => !o)}
            >
              <span className="text-muted text-xs">مرتب‌سازی:</span>
              <span>{SORT_OPTIONS.find((o) => o.key === sort)?.label}</span>
              <Icon name="chevron-down" size={12} />
            </button>
            {sortOpen && (
              <div className="absolute top-[calc(100%+4px)] left-0 min-w-[180px] bg-surface border border-rule rounded-[4px] shadow-[0_8px_24px_rgba(26,15,29,0.1)] z-20 [direction:rtl] max-[768px]:left-auto max-[768px]:right-0">
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

        <div className="grid grid-cols-[280px_1fr] gap-8 pb-[88px] max-[1100px]:grid-cols-1">
          <FilterPanel
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
            priceMin={priceMin}
            priceMax={priceMax}
            materials={[]}
            selectedColorIds={selectedColorIds}
            inStockOnly={inStockOnly}
            availableMaterials={[]}
            materialCounts={{}}
            availableColors={availableColors}
            onPriceMinChange={handlePriceMin}
            onPriceMaxChange={handlePriceMax}
            onToggleMaterial={() => {}}
            onToggleColor={handleToggleColor}
            onInStockChange={handleInStock}
            onReset={resetFilters}
          />

          <section>
            {loading ? (
              <div className="products-grid" style={{ opacity: 0.5 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 8, minHeight: 280 }} />
                ))}
              </div>
            ) : paginated.length > 0 ? (
              <div className={`products-grid${viewMode ? ` ${viewMode}` : ''}`}>
                {paginated.map((p, i) => <ProductCard key={p.id} product={p} onAdd={addItem} priority={i < 4} />)}
              </div>
            ) : (
              <div className="mt-12 p-8 bg-surface rounded-[var(--radius)] grid grid-cols-[auto_1fr_auto] gap-6 items-center border border-rule max-[640px]:grid-cols-1 max-[640px]:text-center">
                <span className="w-16 h-16 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 max-[640px]:mx-auto">
                  <Icon name="search" size={30} strokeWidth={1.4} />
                </span>
                <div>
                  <h4 className="font-heading text-[18px] font-semibold m-0 mb-1">محصولی با این فیلترها یافت نشد</h4>
                  <p className="m-0 text-muted text-[13px]">فیلترها را آزادتر کنید یا همه را پاک کنید.</p>
                </div>
                <button className={BTN_CLS} onClick={resetFilters} style={{ padding: '11px 18px' }}>
                  پاک کردن فیلترها
                </button>
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="mt-9 flex items-center justify-center gap-1.5 py-6 border-t border-rule">
                <button
                  className="text-muted inline-flex items-center gap-1.5 font-body text-[13px] border-none bg-transparent cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:text-ink"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <Icon name="arrow-left" size={14} />
                  قبلی
                </button>
                {pages.map((p) => (
                  <button
                    key={p}
                    className={`min-w-[38px] h-[38px] rounded-lg text-[14px] border px-3 font-mono bg-transparent cursor-pointer transition-all duration-150 ${p === page ? 'bg-ink text-bg border-ink' : 'text-ink border-transparent hover:bg-bg-2'}`}
                    onClick={() => setPage(p)}
                  >
                    {toFa(p)}
                  </button>
                ))}
                <button
                  className="text-muted inline-flex items-center gap-1.5 font-body text-[13px] border-none bg-transparent cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:text-ink"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  بعدی
                  <Icon name="arrow-right" size={14} />
                </button>
              </div>
            )}

            {!loading && nextCursor && (
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
    </PullToRefresh>
  )
}

export default CategoryPage
