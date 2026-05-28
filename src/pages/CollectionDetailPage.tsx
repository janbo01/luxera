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
  usePageMeta({ title: collection?.name_fa ?? 'مجموعه', canonical: slug ? `/collections/${slug}` : undefined })

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
      <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)] py-20 text-center">
        <span className="inline-block w-5 h-5 border-2 border-plate border-t-plum rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="py-[88px] px-[clamp(20px,4vw,56px)] text-center text-muted font-body text-lg">
        <p>{error || 'کالکشن یافت نشد.'}</p>
        <Link to="/collections" className="text-plum underline mt-4 inline-block">
          بازگشت به کالکشن‌ها
        </Link>
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

      {/* Collection banner */}
      <div
        className={`relative grid grid-cols-[1fr_auto] items-center gap-10 min-h-[320px] px-[clamp(20px,4vw,56px)] py-16 overflow-hidden animate-rise max-[768px]:grid-cols-1 max-[768px]:min-h-[220px] max-[768px]:px-5 max-[768px]:py-10 ${toneClass(collection.tone, 'coll-banner')}`}
        style={toneStyle(collection.tone)}
      >
        {/* Top tag */}
        <span className="absolute top-6 right-[clamp(20px,4vw,56px)] font-mono text-[10px] tracking-[0.18em] bg-white/12 border border-white/28 px-2.5 py-1.5 backdrop-blur-[4px]">
          کالکشن / COLLECTION
        </span>

        <div className="flex flex-col gap-2 z-[2]">
          <span className="font-mono text-[11px] tracking-[0.2em] opacity-55">کالکشن / COLLECTION</span>
          <h1 className="font-heading font-bold text-[clamp(44px,6vw,72px)] leading-none tracking-[-0.01em] m-0">
            {collection.name_fa}
          </h1>
          {collection.name_en && (
            <span className="font-body text-xl opacity-65">{collection.name_en}</span>
          )}
          {collection.description && (
            <p className="text-[15px] opacity-75 mt-1 max-w-[40ch] max-[768px]:hidden">
              {collection.description}
            </p>
          )}
        </div>

        <div className="relative w-[clamp(120px,16vw,220px)] flex items-center justify-center shrink-0 z-[2] max-[768px]:hidden" aria-hidden>
          {collection.cover_image_url ? (
            <img src={collection.cover_image_url} alt={collection.name_fa} className="w-full h-full object-cover" style={{ borderRadius: 8 }} />
          ) : (
            <span className="font-display italic text-[200px] font-normal opacity-[0.12] leading-none select-none">
              {(collection.name_en ?? collection.name_fa).charAt(0)}
            </span>
          )}
        </div>
      </div>

      <section className="py-[88px] px-[clamp(20px,4vw,56px)]">
        <div className="flex items-center justify-between mb-12 gap-6">
          <h2 className="font-heading font-bold text-[clamp(24px,3vw,36px)] m-0 text-ink">
            {toFa(products.length)} محصول در این کالکشن
          </h2>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[18px]">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addItem} />
            ))}
          </div>
        ) : (
          <div className="py-[88px] px-[clamp(20px,4vw,56px)] text-center text-muted font-body text-lg">
            <p>این کالکشن موقتاً تمام شده.</p>
            <Link to="/collections" className="text-plum underline mt-4 inline-block">
              بازگشت به کالکشن‌ها
            </Link>
          </div>
        )}
      </section>
    </>
  )
}

export default CollectionDetailPage
