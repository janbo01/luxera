import { usePageMeta } from '../hooks/usePageMeta'
import { useEffect, useCallback, useState, type FC } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { useSearchStore } from '../store/searchStore'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/product/ProductCard'
import Breadcrumb from '../components/shared/Breadcrumb'
import { BTN_GHOST_CLS } from '../components/ui/Button'
import PullToRefresh from '../components/shared/PullToRefresh'
import { Illustration } from '../illustrations'
import { toFa } from '../utils/format'
import { SEARCH_MIN_QUERY_LENGTH } from '../utils/constants'
import { listProducts, adaptProduct } from '../api/product'
import type { Product } from '../types'

const SearchResultsPage: FC = () => {
  usePageMeta({ title: 'نتایج جستجو', noIndex: true })
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const addItem = useCartStore((s) => s.addItem)
  const { commit } = useSearchStore()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (q) commit(q)
  }, [q, commit])

  useEffect(() => {
    const trimmed = q.trim()
    void (async () => {
      if (trimmed.length < SEARCH_MIN_QUERY_LENGTH) {
        setProducts([])
        return
      }
      setLoading(true)
      try {
        const { items } = await listProducts({ q: trimmed, limit: 40 })
        setProducts(items.map((p) => adaptProduct(p)))
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    })()
  }, [q])

  const catSuggestions = CATEGORIES.slice(0, 6)

  const handleRefresh = useCallback(async () => {
    const trimmed = q.trim()
    if (trimmed.length < SEARCH_MIN_QUERY_LENGTH) return
    setLoading(true)
    const { items } = await listProducts({ q: trimmed, limit: 40 }).catch(() => ({ items: [] }))
    setProducts(items.map((p) => adaptProduct(p)))
    setLoading(false)
  }, [q])

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <Breadcrumb items={[
        { label: 'خانه', to: '/' },
        { label: 'نتایج جستجو' },
      ]} />

      <section className="py-[88px] px-[clamp(20px,4vw,56px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 gap-6">
          <h1 className="font-heading font-bold text-[clamp(24px,3vw,36px)] m-0 text-ink [&_em]:font-heading [&_em]:not-italic [&_em]:text-plum [&_em]:font-normal">
            {loading
              ? <>در حال جستجو برای <em>«{q}»</em>…</>
              : products.length > 0
              ? <>{toFa(products.length)} نتیجه برای <em>«{q}»</em></>
              : <>جستجو: <em>«{q}»</em></>}
          </h1>
        </div>

        {loading ? (
          <div className="products grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[18px]" style={{ opacity: 0.5 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 8, minHeight: 280 }} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="products grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[18px]">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addItem} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-4 px-[clamp(20px,4vw,56px)] py-20 text-center min-h-[50vh]">
            <div className="w-40 h-40 text-muted opacity-[0.55]">
              <Illustration name="SearchEmpty" />
            </div>
            <p className="text-[22px] font-extralight text-ink m-0" role="status">
              نتیجه‌ای برای «{q}» یافت نشد
            </p>
            <p className="text-sm text-muted m-0">
              از کلمات کلیدی دیگر یا دسته‌بندی‌های زیر استفاده کنید
            </p>
            <div className="flex flex-wrap gap-2.5 justify-center my-1 mb-2">
              {catSuggestions.map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.id}`}
                  className="bg-plate border border-rule rounded-[2px] px-4 py-2 text-[13px] text-ink-2 transition-[background,color] duration-200 hover:bg-ink hover:text-bg"
                >
                  {c.fa}
                </Link>
              ))}
            </div>
            <Link to="/category/new" className={BTN_GHOST_CLS}>
              مشاهده همه محصولات
            </Link>
          </div>
        )}
      </section>
    </PullToRefresh>
  )
}

export default SearchResultsPage
