import { usePageMeta } from '../hooks/usePageMeta'
import { useState, useMemo, useCallback, useEffect, type FC } from 'react'
import { useParams, Link } from 'react-router-dom'
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
  usePageMeta({ title: category?.fa ?? 'دسته‌بندی' })

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
      <div className="cat-not-found">
        <p>دسته‌بندی یافت نشد.</p>
        <Link to="/">بازگشت به خانه</Link>
      </div>
    )
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="wrap">
        <CategoryHero
          category={category}
          catId={id!}
          productCount={allProducts.length}
          catProductCounts={catProductCounts}
        />
      </div>

      <main className="wrap">
        <div className="mfilter">
          <button onClick={() => setFilterOpen(true)}>
            فیلترها · {toFa(sorted.length)} محصول
          </button>
        </div>

        <div className="toolbar">
              <div className="tb-count">
                <span>نمایش</span>
                <span className="n">{loading ? '…' : toFa(paginated.length)}</span>
                <span>از</span>
                <span className="n">{loading ? '…' : toFa(sorted.length)}</span>
                <span>{category.fa}</span>
              </div>

              {appliedChips.length > 0 && (
                <div className="tb-applied">
                  {appliedChips.map((chip, i) => (
                    <span key={i} className="ap">
                      {chip.label}
                      <button onClick={chip.remove} aria-label="حذف فیلتر">
                        <Icon name="x" size={9} />
                      </button>
                    </span>
                  ))}
                  <button className="clear" onClick={resetFilters}>پاک کردن</button>
                </div>
              )}

              <div className="tb-spacer" />

              <div className="tb-views">
                {VIEW_MODES.map(({ mode, title, Icon: ModeIcon }) => (
                  <button
                    key={mode || 'default'}
                    className={viewMode === mode ? 'on' : ''}
                    onClick={() => setViewMode(mode)}
                    title={title}
                  >
                    <ModeIcon size={14} strokeWidth={1.6} />
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative' }}>
                <button className="tb-sort" onClick={() => setSortOpen((o) => !o)}>
                  <span className="lbl">مرتب‌سازی:</span>
                  <span>{SORT_OPTIONS.find((o) => o.key === sort)?.label}</span>
                  <Icon name="chevron-down" size={12} />
                </button>
                {sortOpen && (
                  <div className="sort-dropdown__panel">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        className={`sort-dropdown__option${sort === opt.key ? ' is-active' : ''}`}
                        onClick={() => handleSort(opt.key)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
        </div>

        <div className="body-grid">
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
              <div className="grid" style={{ opacity: 0.5 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 8, minHeight: 280 }} />
                ))}
              </div>
            ) : paginated.length > 0 ? (
              <div className={`grid${viewMode ? ` ${viewMode}` : ''}`}>
                {paginated.map((p) => <ProductCard key={p.id} product={p} onAdd={addItem} />)}
              </div>
            ) : (
              <div className="supplement">
                <span className="ic">
                  <Icon name="search" size={30} strokeWidth={1.4} />
                </span>
                <div>
                  <h4>محصولی با این فیلترها یافت نشد</h4>
                  <p>فیلترها را آزادتر کنید یا همه را پاک کنید.</p>
                </div>
                <button className="btn" onClick={resetFilters} style={{ padding: '11px 18px' }}>
                  پاک کردن فیلترها
                </button>
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="pager">
                <button className="nav-btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <Icon name="arrow-left" size={14} />
                  قبلی
                </button>
                {pages.map((p) => (
                  <button key={p} className={p === page ? 'on' : ''} onClick={() => setPage(p)}>
                    {toFa(p)}
                  </button>
                ))}
                <button className="nav-btn" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  بعدی
                  <Icon name="arrow-right" size={14} />
                </button>
              </div>
            )}

            {!loading && nextCursor && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  className="btn btn--ghost"
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
