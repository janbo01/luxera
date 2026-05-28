import { usePageMeta } from '../hooks/usePageMeta'
import { useState, useEffect, useCallback, useMemo, type FC } from 'react'
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
import type { ProductDetail } from '../types'

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

const ProductPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const addItem = useCartStore((s) => s.addItem)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const handleSizeGuide = useCallback(() => setSizeGuideOpen(true), [])
  const handleCloseSizeGuide = useCallback(() => setSizeGuideOpen(false), [])
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [apiDetail, setApiDetail] = useState<ApiProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    title: product?.fa ?? 'محصول',
    description: product?.description || undefined,
    canonical: id ? `/product/${id}` : undefined,
    ogImage: apiDetail?.images?.[0]?.url,
    jsonLd: productJsonLd,
  })

  useEffect(() => {
    if (!id) return
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const detail = await getProduct(id)
        setApiDetail(detail)
        setProduct(adaptDetail(detail))
        // Gallery shows images.slice(1) as main when 2+ images exist, images[0] otherwise
        const heroImageUrl = detail.images && detail.images.length > 1
          ? detail.images[1].url
          : detail.images?.[0]?.url
        if (heroImageUrl) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = heroImageUrl
          link.setAttribute('fetchpriority', 'high')
          document.head.appendChild(link)
        }
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
      <section className="px-[var(--pad)] max-w-[var(--maxw)] mx-auto pt-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[56%_1fr] gap-8 lg:gap-10 items-start">
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
