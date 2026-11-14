import { usePageMeta } from '../hooks/usePageMeta'
import { useEffect, useCallback, useMemo, useState, type FC } from 'react'
import { CATEGORIES } from '../data/categories'
import { useSearchStore } from '../store/searchStore'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/product/ProductCard'
import PageHeader from '../components/shared/PageHeader'
import { BTN_GHOST_CLS } from '../components/ui/Button'
import PullToRefresh from '../components/shared/PullToRefresh'
import Icon from '../components/icons/Icon'
import { Illustration } from '../illustrations'
import { normalizeQuery, toFa } from '../utils/format'
import { SEARCH_MIN_QUERY_LENGTH } from '../utils/constants'
import { listProducts, adaptProduct } from '../api/product'
import type { Product } from '../types'

interface SearchResultsPageProps {
  q?: string
}

type SortKey = 'relevance' | 'price-asc' | 'price-desc'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'relevance', label: 'مرتبط‌ترین' },
  { key: 'price-asc', label: 'ارزان‌ترین' },
  { key: 'price-desc', label: 'گران‌ترین' },
]

/** The whole catalogue is about a hundred pieces, so one request returns every match. */
const RESULT_LIMIT = 100

const SearchResultsPage: FC<SearchResultsPageProps> = ({ q: qProp }) => {
  usePageMeta({ title: 'نتایج جستجو', noIndex: true })
  const q =
    qProp ??
    (typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('q') ?? '')
      : '')
  const addItem = useCartStore((s) => s.addItem)
  const { commit } = useSearchStore()

  const [products, setProducts] = useState<Product[]>([])
  // Start in the loading state when there's a query to run: starting at false painted the
  // "no results" block for a frame, then the skeleton, then the results — each swap a jump.
  const [loading, setLoading] = useState(() => normalizeQuery(q).length >= SEARCH_MIN_QUERY_LENGTH)
  const [sort, setSort] = useState<SortKey>('relevance')
  const [draft, setDraft] = useState(q)

  const load = useCallback(async (query: string) => {
    const trimmed = normalizeQuery(query)
    if (trimmed.length < SEARCH_MIN_QUERY_LENGTH) {
      setProducts([])
      return
    }
    setLoading(true)
    try {
      const { items } = await listProducts({ q: trimmed, limit: RESULT_LIMIT })
      setProducts(items.map((p) => adaptProduct(p)))
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (q) commit(q)
    // load() sets state after an await; the rule can't see that it's asynchronous.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(q)
  }, [q, commit, load])

  const sorted = useMemo(() => {
    if (sort === 'relevance') return products
    const dir = sort === 'price-asc' ? 1 : -1
    return [...products].sort((a, b) => (a.price - b.price) * dir)
  }, [products, sort])

  const handleRefresh = useCallback(() => load(q), [load, q])

  const searchForm = (
    <form action="/search" method="get" role="search" className="flex gap-2 w-full md:w-[360px]">
      <label htmlFor="search-page-q" className="sr-only">
        جستجو در فروشگاه
      </label>
      <input
        id="search-page-q"
        name="q"
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="جستجو در فروشگاه…"
        enterKeyHint="search"
        className="flex-1 min-w-0 min-h-12 px-4 rounded-full bg-surface border border-rule text-[15px] text-ink outline-none focus:border-ink"
      />
      <button
        type="submit"
        aria-label="جستجو"
        className="w-12 h-12 shrink-0 grid place-items-center rounded-full bg-ink text-bg"
      >
        <Icon name="search" size={17} />
      </button>
    </form>
  )

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <PageHeader
        crumbs={[{ label: 'نتایج جستجو' }]}
        title={q ? `جستجو: «${q}»` : 'جستجو'}
        meta={
          loading ? (
            <span>در حال جستجو…</span>
          ) : q ? (
            <span role="status">{toFa(products.length)} نتیجه</span>
          ) : null
        }
        aside={searchForm}
      />

      <section className="max-w-[var(--maxw)] mx-auto px-[var(--pad)] pb-20">
        {/* Shown (disabled) while loading too, so the results don't land under a sort bar
            that then pushes them down. */}
        {(loading || products.length > 1) && (
          <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="ترتیب نتایج">
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                aria-pressed={sort === s.key}
                disabled={loading}
                onClick={() => setSort(s.key)}
                className={`min-h-11 px-4 rounded-full text-[13.5px] border transition-colors ${
                  sort === s.key
                    ? 'bg-ink text-bg border-ink'
                    : 'bg-surface text-ink-2 border-rule hover:border-ink'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[18px]"
            aria-hidden="true"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface rounded-[var(--radius-sm)] min-h-[280px] opacity-60"
              />
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <div className="products grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[18px]">
            {sorted.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addItem} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-16 text-center min-h-[40vh]">
            <div className="w-36 h-36 text-muted opacity-[0.55]">
              <Illustration name="SearchEmpty" />
            </div>
            <p className="text-[20px] text-ink m-0" role="status">
              {q ? `نتیجه‌ای برای «${q}» پیدا نشد` : 'چه چیزی دنبالش هستید؟'}
            </p>
            <p className="text-sm text-muted m-0">
              کلمه‌ی دیگری امتحان کنید یا از دسته‌بندی‌ها شروع کنید.
            </p>
            <div className="flex flex-wrap gap-2.5 justify-center my-1 mb-2">
              {CATEGORIES.slice(0, 6).map((c) => (
                <a
                  key={c.id}
                  href={`/category/${c.id}`}
                  className="inline-flex items-center min-h-11 bg-surface border border-rule rounded-full px-4 text-[13.5px] text-ink-2 transition-colors hover:border-ink hover:text-ink"
                >
                  {c.fa}
                </a>
              ))}
            </div>
            <a href="/category/new" className={BTN_GHOST_CLS}>
              مشاهده‌ی همه‌ی محصولات
            </a>
          </div>
        )}
      </section>
    </PullToRefresh>
  )
}

export default SearchResultsPage
