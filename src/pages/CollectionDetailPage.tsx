import { usePageMeta } from '../hooks/usePageMeta'
import { useEffect, useState, type FC } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProductCard from '../components/product/ProductCard'
import Breadcrumb from '../components/shared/Breadcrumb'
import { toFa } from '../utils/format'
import { useCartStore } from '../store/cartStore'
import { getCollectionBySlug, adaptProduct, type ApiCollectionDetail } from '../api/product'
import { toneStyle, toneClass } from '../utils/toneStyle'
import type { Product } from '../types'

const CollectionDetailPage: FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const addItem = useCartStore((s) => s.addItem)
  const [collection, setCollection] = useState<ApiCollectionDetail | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  usePageMeta({ title: collection?.name_fa ?? 'مجموعه' })

  useEffect(() => {
    if (!slug) return
    void (async () => {
      setLoading(true)
      try {
        const col = await getCollectionBySlug(slug)
        setCollection(col)
        setProducts(col.products.map((p) => adaptProduct(p)))
      } catch (e) {
        setError((e as { message?: string })?.message ?? 'خطا در بارگذاری کالکشن')
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  if (loading) {
    return (
      <div className="wrap" style={{ padding: '80px 0', textAlign: 'center' }}>
        <span className="spinner" />
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="cat-not-found">
        <p>{error || 'کالکشن یافت نشد.'}</p>
        <Link to="/collections">بازگشت به کالکشن‌ها</Link>
      </div>
    )
  }

  return (
    <>
      <Breadcrumb items={[
        { label: 'خانه', to: '/' },
        { label: 'کالکشن‌ها', to: '/collections' },
        { label: collection.name_fa },
      ]} />

      <div
        className={`coll-banner ${toneClass(collection.tone, 'coll-banner')} anim-in`}
        style={toneStyle(collection.tone)}
      >
        <div className="coll-banner__text">
          <span className="coll-banner__kicker">کالکشن / COLLECTION</span>
          <h1 className="coll-banner__title">{collection.name_fa}</h1>
          {collection.name_en && (
            <span className="coll-banner__subtitle">{collection.name_en}</span>
          )}
          {collection.description && (
            <p className="coll-banner__tagline">{collection.description}</p>
          )}
        </div>
        {collection.cover_image_url ? (
          <div className="coll-banner__art" aria-hidden>
            <img src={collection.cover_image_url} alt={collection.name_fa} className="img-cover" style={{ borderRadius: 8 }} />
          </div>
        ) : (
          <div className="coll-banner__art" aria-hidden>
            <span className="coll-banner__letter">
              {(collection.name_en ?? collection.name_fa).charAt(0)}
            </span>
          </div>
        )}
      </div>

      <section className="section">
        <div className="search-results__head">
          <h2 className="search-results__title">
            {toFa(products.length)} محصول در این کالکشن
          </h2>
        </div>

        {products.length > 0 ? (
          <div className="products">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addItem} />
            ))}
          </div>
        ) : (
          <div className="cat-empty">
            <p>این کالکشن موقتاً تمام شده.</p>
            <Link to="/collections">بازگشت به کالکشن‌ها</Link>
          </div>
        )}
      </section>
    </>
  )
}

export default CollectionDetailPage
