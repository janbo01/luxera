import { usePageMeta } from '../hooks/usePageMeta'
import { useEffect, useCallback, useState, type FC } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CATEGORIES } from '../data/categories'
import { useSearchStore } from '../store/searchStore'
import { useCartStore } from '../store/cartStore'
import ProductCard from '../components/product/ProductCard'
import Breadcrumb from '../components/shared/Breadcrumb'
import PullToRefresh from '../components/shared/PullToRefresh'
import { Illustration } from '../illustrations'
import { toFa } from '../utils/format'
import { SEARCH_MIN_QUERY_LENGTH } from '../utils/constants'
import { listProducts, adaptProduct } from '../api/product'
import type { Product } from '../types'

const SearchResultsPage: FC = () => {
  usePageMeta({ title: 'نتایج جستجو' })
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

      <section className="search-results section">
        <div className="search-results__head">
          <h1 className="search-results__title">
            {loading
              ? <>در حال جستجو برای <em>«{q}»</em>…</>
              : products.length > 0
              ? <>{toFa(products.length)} نتیجه برای <em>«{q}»</em></>
              : <>جستجو: <em>«{q}»</em></>}
          </h1>
        </div>

        {loading ? (
          <div className="products" style={{ opacity: 0.5 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--color-surface)', borderRadius: 8, minHeight: 280 }} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="products">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addItem} />
            ))}
          </div>
        ) : (
          <div className="search-empty">
            <div className="search-empty__illus">
              <Illustration name="SearchEmpty" />
            </div>
            <p className="search-empty__title" role="status">
              نتیجه‌ای برای «{q}» یافت نشد
            </p>
            <p className="search-empty__hint">
              از کلمات کلیدی دیگر یا دسته‌بندی‌های زیر استفاده کنید
            </p>
            <div className="search-empty__cats">
              {catSuggestions.map((c) => (
                <Link key={c.id} to={`/category/${c.id}`} className="search-empty__cat-chip">
                  {c.fa}
                </Link>
              ))}
            </div>
            <Link to="/category/new" className="btn btn--ghost">
              مشاهده همه محصولات
            </Link>
          </div>
        )}
      </section>
    </PullToRefresh>
  )
}

export default SearchResultsPage
