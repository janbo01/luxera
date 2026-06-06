import { usePageMeta } from '../hooks/usePageMeta'
import { useEffect, useState, useRef, useMemo, type FC } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProductCard from '../components/product/ProductCard'
import Breadcrumb from '../components/shared/Breadcrumb'
import { toFa } from '../utils/format'
import { useCartStore } from '../store/cartStore'
import { getCollectionBySlug, adaptProduct, type ApiCollectionDetail } from '../api/product'
import { toneStyle, toneClass } from '../utils/toneStyle'
import { useInitialData } from '../context/initialData'
import type { Product } from '../types'

declare global {
  interface Window {
    __COLLECTION_INITIAL__?: ApiCollectionDetail
  }
}

function getInitialCollection(
  slug: string | undefined,
  serverCollection: unknown,
): ApiCollectionDetail | null {
  if (!slug) return null
  if (
    serverCollection &&
    typeof serverCollection === 'object' &&
    (serverCollection as ApiCollectionDetail).slug === slug
  ) return serverCollection as ApiCollectionDetail
  if (
    typeof window !== 'undefined' &&
    window.__COLLECTION_INITIAL__?.slug === slug
  ) return window.__COLLECTION_INITIAL__
  return null
}

const CollectionDetailPage: FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const addItem = useCartStore((s) => s.addItem)

  const { collection: serverCollection } = useInitialData()
  const [initial] = useState(() => getInitialCollection(slug, serverCollection))

  const [collection, setCollection] = useState<ApiCollectionDetail | null>(initial)
  const [products, setProducts] = useState<Product[]>(() =>
    initial ? initial.products.map((p) => adaptProduct(p)) : [],
  )
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState('')
  const seededSlugRef = useRef<string | null>(initial?.slug ?? null)

  const collectionJsonLd = useMemo(() => {
    if (!collection || !slug) return undefined
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: collection.name_fa,
      url: `https://luxera.ir/collections/${slug}`,
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.fa,
        url: `https://luxera.ir/product/${p.slug ?? p.id}`,
      })),
    }
  }, [collection, slug, products])

  usePageMeta({
    title: collection?.name_fa ?? 'مجموعه',
    canonical: slug ? `/collections/${slug}` : undefined,
    jsonLd: collectionJsonLd,
  })

  useEffect(() => {
    if (!slug) return
    if (seededSlugRef.current === slug) { seededSlugRef.current = null; return }
    void (async () => {
      setLoading(true)
      setError('')
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

  const col = collection

  return (
    <>
      <Breadcrumb items={[
        { label: 'خانه', to: '/' },
        { label: 'کالکشن‌ها', to: '/collections' },
        { label: col.name_fa },
      ]} />

      {/* ── Cinematic banner ── */}
      <div
        className={[
          'relative overflow-hidden flex flex-col justify-end animate-rise',
          toneClass(col.tone, 'coll-banner'),
        ].join(' ')}
        style={{
          ...toneStyle(col.tone),
          minHeight: 'clamp(360px, 52vh, 580px)',
          paddingInline: 'clamp(20px, 4vw, 56px)',
          paddingBottom: 'clamp(40px, 6vw, 72px)',
          paddingTop: '80px',
        }}
      >
        {/* Cover image (if present) — full bleed behind content */}
        {col.cover_image_url && (
          <img
            src={col.cover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
            aria-hidden
          />
        )}

        {/* English name — massive ghost watermark */}
        {col.name_en && (
          <div
            className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none"
            aria-hidden
          >
            <span
              className="font-display italic font-light leading-[0.85] whitespace-nowrap pe-[clamp(20px,4vw,56px)]"
              style={{
                fontSize: 'clamp(140px, 20vw, 300px)',
                opacity: 0.1,
                transform: 'translateY(8%)',
              }}
            >
              {col.name_en}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4 max-w-[800px]">
          {/* Kicker */}
          <span className="font-mono text-[10px] tracking-[0.22em] opacity-60 uppercase">
            COLLECTION
            {col.name_en ? ` · ${col.name_en}` : ''}
          </span>

          {/* Persian heading — editorial scale */}
          <h1
            className="font-heading font-bold leading-[0.95] tracking-[-0.02em] m-0"
            style={{ fontSize: 'clamp(52px, 8vw, 96px)' }}
          >
            {col.name_fa}
          </h1>

          {/* Ornamental separator */}
          <div className="flex items-center gap-3 mt-1">
            <div className="h-px w-12 bg-current opacity-30" />
            <span className="opacity-25 text-[11px] font-display" aria-hidden>✦</span>
            <div className="h-px w-40 bg-current opacity-15" />
          </div>

          {/* Description */}
          {col.description && (
            <p
              className="text-[14px] leading-[1.9] opacity-75 max-[768px]:hidden"
              style={{ maxWidth: '52ch' }}
            >
              {col.description}
            </p>
          )}

          {/* Product count pill */}
          <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] opacity-55 mt-1">
            <span
              className="w-1.5 h-1.5 rounded-full bg-current opacity-70"
              aria-hidden
            />
            {toFa(products.length)} محصول در این کالکشن
          </span>
        </div>
      </div>

      {/* ── Product grid section ── */}
      <section className="py-[88px] px-[clamp(20px,4vw,56px)] max-w-[1480px] mx-auto">

        {/* Ornamental divider */}
        <div className="flex items-center gap-5 mb-14">
          <div className="h-px flex-1 bg-rule" />
          <span className="font-display italic text-[22px] text-muted/60 font-light select-none" aria-hidden>
            ✦
          </span>
          <div className="h-px flex-1 bg-rule" />
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[18px]">
            {products.map((p, i) => (
              <div
                key={p.id}
                className="animate-rise"
                style={{ animationDelay: `${Math.min(i, 7) * 60}ms` } as React.CSSProperties}
              >
                <ProductCard product={p} onAdd={addItem} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-[88px] text-center text-muted font-body text-lg">
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
