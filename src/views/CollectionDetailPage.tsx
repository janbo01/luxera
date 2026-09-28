import { usePageMeta } from '../hooks/usePageMeta'
import { useEffect, useState, useRef, useMemo, type FC } from 'react'
import ProductCard from '../components/product/ProductCard'
import PageIntro from '../components/shared/PageIntro'
import Breadcrumb from '../components/shared/Breadcrumb'
import { toFa } from '../utils/format'
import { useCartStore } from '../store/cartStore'
import { getCollectionBySlug, adaptProduct, type ApiCollectionDetail } from '../api/product'
import { imgSet } from '../utils/cdnImage'
import type { ServerInitialData } from '../context/initialData'
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
  )
    return serverCollection as ApiCollectionDetail
  if (typeof window !== 'undefined' && window.__COLLECTION_INITIAL__?.slug === slug)
    return window.__COLLECTION_INITIAL__
  return null
}

interface CollectionDetailPageProps {
  slug: string
  initialData?: ServerInitialData
}

const CollectionDetailPage: FC<CollectionDetailPageProps> = ({ slug, initialData }) => {
  const addItem = useCartStore((s) => s.addItem)

  const { collection: serverCollection } = initialData ?? {}
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
    if (seededSlugRef.current === slug) {
      seededSlugRef.current = null
      return
    }
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
        <a href="/collections" className="text-plum underline mt-4 inline-block">
          بازگشت به کالکشن‌ها
        </a>
      </div>
    )
  }

  const col = collection

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'خانه', to: '/' },
          { label: 'کالکشن‌ها', to: '/collections' },
          { label: col.name_fa },
        ]}
      />

      <div className="max-w-[var(--maxw)] mx-auto px-[var(--pad)]">
        <PageIntro
          kicker={col.name_en ? `Collection · ${col.name_en}` : 'Collection'}
          title={col.name_fa}
          description={col.description}
          meta={<span>{toFa(products.length)} محصول در این کالکشن</span>}
          aside={
            col.cover_image_url || products.some((p) => p.imageUrl) ? (
              <div className="hidden md:flex gap-2 w-[min(38vw,420px)]" aria-hidden>
                {col.cover_image_url ? (
                  <img
                    {...imgSet(col.cover_image_url, {
                      widths: [480, 840],
                      ratio: 16 / 10,
                      sizes: '420px',
                    })}
                    alt=""
                    fetchPriority="high"
                    decoding="async"
                    className="w-full aspect-[16/10] object-cover rounded-[var(--radius)]"
                  />
                ) : (
                  products
                    .filter((p) => p.imageUrl)
                    .slice(0, 3)
                    .map((p, i) => (
                      <img
                        key={p.id}
                        {...imgSet(p.imageUrl!, {
                          widths: [240, 480],
                          ratio: 3 / 4,
                          sizes: '140px',
                        })}
                        alt=""
                        decoding="async"
                        className={`flex-1 min-w-0 aspect-[3/4] object-cover rounded-[var(--radius)] ring-1 ring-rule ${i === 1 ? 'translate-y-4' : ''}`}
                      />
                    ))
                )}
              </div>
            ) : undefined
          }
        />
      </div>

      {/* ── Product grid section ── */}
      <section className="pt-8 md:pt-12 pb-[clamp(56px,7vw,96px)] px-[var(--pad)] max-w-[var(--maxw)] mx-auto">
        <h2 className="sr-only">محصولاتِ این کالکشن</h2>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-[clamp(12px,1.5vw,22px)] gap-y-[clamp(28px,3vw,44px)]">
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
            <a href="/collections" className="text-plum underline mt-4 inline-block">
              بازگشت به کالکشن‌ها
            </a>
          </div>
        )}
      </section>
    </>
  )
}

export default CollectionDetailPage
