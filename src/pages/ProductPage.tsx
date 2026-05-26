import { usePageMeta } from '../hooks/usePageMeta'
import { useState, useEffect, useCallback, type FC } from 'react'
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
  usePageMeta({ title: product?.fa ?? 'محصول' })

  useEffect(() => {
    if (!id) return
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
      <section className="pdp">
        <div className="pdp-grid">
          <InfoPanel
            product={product}
            apiColors={apiDetail?.colors}
            apiSizes={apiDetail?.sizes}
            apiVariants={apiDetail?.variants}
            onAdd={addItem}
            onSizeGuide={handleSizeGuide}
          />
          <Gallery images={apiDetail?.images} productName={product.fa} />
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
