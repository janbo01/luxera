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

function matchesProduct(product: ApiProductDetail, idOrSlug: string): boolean {
  return product.id === idOrSlug || product.slug === idOrSlug
}

function getInitialApiDetail(id: string | undefined, serverProduct: unknown): ApiProductDetail | null {
  if (!id) return null
  // SSR path: data provided via React context
  if (serverProduct && typeof serverProduct === 'object' && matchesProduct(serverProduct as ApiProductDetail, id)) {
    return serverProduct as ApiProductDetail
  }
  // Client path: data injected as window variable by server
  if (typeof window !== 'undefined' && window.__PRODUCT_INITIAL__ && matchesProduct(window.__PRODUCT_INITIAL__, id)) {
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

  const { product: serverProduct, productComments: serverComments } = useInitialData()
  const initialApiDetail = getInitialApiDetail(id, serverProduct)

  // Initialise from server-provided data so SSR and first client render match
  const [product, setProduct] = useState<ProductDetail | null>(() =>
    initialApiDetail ? adaptDetail(initialApiDetail) : null,
  )
  const [apiDetail, setApiDetail] = useState<ApiProductDetail | null>(() => initialApiDetail)
  const [loading, setLoading] = useState(!initialApiDetail)
  const [error, setError] = useState('')

  // Track which id/slug was seeded by the server so we skip the initial fetch
  const seededIdRef = useRef<string | null>(
    initialApiDetail ? (initialApiDetail.slug ?? initialApiDetail.id) : null,
  )

  const productJsonLd = useMemo(() => {
    if (!product || !apiDetail || !id) return undefined
    type InitialComment = { id: string; user_id: string; content: string; rating?: number; created_at: string }
    const initialComments = (serverComments as InitialComment[] | undefined) ?? []
    const urlSlug = apiDetail.slug ?? id
    const productUrl = `https://luxera.ir/product/${urlSlug}`

    const merchantReturnPolicy = {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'IR',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 4,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
      returnPolicyLink: 'https://luxera.ir/shipping',
    }

    const shippingDetails = {
      '@type': 'OfferShippingDetails',
      shippingRate: { '@type': 'MonetaryAmount', value: '180000', currency: 'IRR' },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IR' },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
      },
    }

    const productNode: Record<string, unknown> = {
      '@type': 'Product',
      name: product.fa,
      description: product.description || undefined,
      image: apiDetail.images?.map((img) => img.url) ?? [],
      url: productUrl,
      sku: apiDetail.slug ?? id,
      brand: { '@type': 'Brand', name: 'لوکسرا' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'IRR',
        price: String(product.price),
        availability:
          apiDetail.variants?.some((v) => v.quantity > 0)
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        url: productUrl,
        hasMerchantReturnPolicy: merchantReturnPolicy,
        shippingDetails,
      },
    }

    if (product.reviewCount > 0) {
      productNode.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: String(Math.max(product.rating, 1)),
        reviewCount: String(product.reviewCount),
        bestRating: '5',
        worstRating: '1',
      }
    }

    if (initialComments.length > 0) {
      productNode.review = initialComments.map((c, i) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: `کاربر ${c.user_id?.slice(0, 4) || String(i + 1)}` },
        datePublished: c.created_at?.slice(0, 10),
        reviewBody: c.content,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: String(c.rating || 5),
          bestRating: '5',
          worstRating: '1',
        },
      }))
    }

    return {
      '@context': 'https://schema.org',
      '@graph': [
        productNode,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'خانه', item: 'https://luxera.ir' },
            ...(product.cat && product.catId ? [{ '@type': 'ListItem', position: 2, name: product.cat, item: `https://luxera.ir/category/${product.catId}` }] : []),
            { '@type': 'ListItem', position: product.catId ? 3 : 2, name: product.fa, item: productUrl },
          ],
        },
      ],
    }
  }, [product, apiDetail, id, serverComments])

  usePageMeta({
    title: apiDetail?.seo_title || product?.fa || 'محصول',
    description: apiDetail?.seo_description || product?.description || undefined,
    keywords: apiDetail?.seo_keywords || undefined,
    canonical: id ? `/product/${apiDetail?.slug ?? id}` : undefined,
    ogImage: apiDetail?.images?.[0]?.url,
    ogType: 'product',
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
