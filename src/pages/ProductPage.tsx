import { usePageMeta } from '../hooks/usePageMeta'
import { useState, useEffect, useCallback, useMemo, useRef, type FC } from 'react'
import { useParams, Link } from 'react-router-dom'
import Breadcrumb from '../components/shared/Breadcrumb'
import Gallery from '../components/product/Gallery'
import InfoPanel from '../components/product/InfoPanel'
import Tabs from '../components/product/Tabs'
import Reviews from '../components/product/Reviews'
import Related from '../components/product/Related'
import SizeGuideModal from '../components/product/SizeGuideModal'
import { useCartStore } from '../store/cartStore'
import { getProduct, adaptProduct, type ApiProductDetail } from '../api/product'
import { useInitialData } from '../context/initialData'
import type { ProductDetail } from '../types'

declare global {
  interface Window {
    __PRODUCT_INITIAL__?: ApiProductDetail
  }
}

function adaptDetail(api: ApiProductDetail): ProductDetail {
  const base = adaptProduct(api)
  return {
    ...base,
    rating: api.rating ?? 0,
    reviewCount: api.review_count ?? 0,
    description: api.long_description ?? api.short_description ?? '',
    highlights: api.highlights ?? [],
    specs: (api.specs ?? []).map((row) => [row[0] ?? '', row[1] ?? ''] as [string, string]),
    stockCount: 0,
    imageUrl: api.images?.[0]?.url,
    imageUrlAlt: api.images?.[1]?.url,
  }
}

function getInitialApiDetail(id: string | undefined, serverProduct: unknown): ApiProductDetail | null {
  if (!id) return null
  // SSR path: data provided via React context
  if (serverProduct && typeof serverProduct === 'object' && (serverProduct as ApiProductDetail).id === id) {
    return serverProduct as ApiProductDetail
  }
  // Client path: data injected as window variable by server
  if (typeof window !== 'undefined' && window.__PRODUCT_INITIAL__?.id === id) {
    return window.__PRODUCT_INITIAL__
  }
  return null
}

const ProductPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const addItem = useCartStore((s) => s.addItem)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const handleSizeGuide = useCallback(() => setSizeGuideOpen(true), [])
  const handleCloseSizeGuide = useCallback(() => setSizeGuideOpen(false), [])

  const { product: serverProduct } = useInitialData()
  const initialApiDetail = getInitialApiDetail(id, serverProduct)

  // Initialise from server-provided data so SSR and first client render match
  const [product, setProduct] = useState<ProductDetail | null>(() =>
    initialApiDetail ? adaptDetail(initialApiDetail) : null,
  )
  const [apiDetail, setApiDetail] = useState<ApiProductDetail | null>(() => initialApiDetail)
  const [loading, setLoading] = useState(!initialApiDetail)
  const [error, setError] = useState('')

  // Track which product id was seeded by the server so we skip the initial fetch
  const seededIdRef = useRef<string | null>(initialApiDetail?.id ?? null)

  const productJsonLd = useMemo(() => {
    if (!product || !apiDetail || !id) return undefined
    const productUrl = `https://luxera.ir/product/${id}`
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.fa,
      description: product.description || undefined,
      image: apiDetail.images?.map((img) => img.url) ?? [],
      url: productUrl,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'IRR',
        price: String(product.price),
        availability:
          apiDetail.variants?.some((v) => v.quantity > 0)
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        url: productUrl,
      },
    }
    if (product.rating && product.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: String(product.rating),
        reviewCount: String(product.reviewCount),
      }
    }
    return schema
  }, [product, apiDetail, id])

  usePageMeta({
    title: apiDetail?.seo_title || product?.fa || 'محصول',
    description: apiDetail?.seo_description || product?.description || undefined,
    keywords: apiDetail?.seo_keywords || undefined,
    canonical: id ? `/product/${id}` : undefined,
    ogImage: apiDetail?.images?.[0]?.url,
    jsonLd: productJsonLd,
  })

  useEffect(() => {
    if (!id) return
    // Skip the first fetch when the server already seeded this product's data
    if (seededIdRef.current === id) {
      seededIdRef.current = null
      return
    }
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const detail = await getProduct(id)
        setApiDetail(detail)
        setProduct(adaptDetail(detail))
      } catch (e) {
        setError((e as { message?: string })?.message ?? 'خطا در بارگذاری محصول')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <div className="page-center">
        <span className="spinner" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="page-center">
        <p>{error || 'محصول یافت نشد'}</p>
        <Link to="/">بازگشت به خانه</Link>
      </div>
    )
  }

  return (
    <>
      <Breadcrumb items={[
        { label: 'خانه', to: '/' },
        { label: product.cat || 'محصولات', to: product.cat ? `/category/${product.catId}` : '/' },
        { label: product.fa },
      ]} />
      <section className="px-[var(--pad)] max-w-[var(--maxw)] mx-auto pt-2 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[52%_1fr] gap-8 lg:gap-12 items-start">
          <Gallery images={apiDetail?.images} productName={product.fa} />
          <InfoPanel
            product={product}
            apiColors={apiDetail?.colors}
            apiSizes={apiDetail?.sizes}
            apiVariants={apiDetail?.variants}
            onAdd={addItem}
            onSizeGuide={handleSizeGuide}
          />
        </div>
      </section>
      <Tabs product={product} />
      <Reviews productId={id!} rating={product.rating} reviewCount={product.reviewCount} />
      <Related categoryId={product.catId} excludeId={id} />
      <SizeGuideModal open={sizeGuideOpen} onClose={handleCloseSizeGuide} />
    </>
  )
}

export default ProductPage
