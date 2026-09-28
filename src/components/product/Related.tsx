import { useState, useEffect, memo, type FC } from 'react'

import SectionHeader from '../shared/SectionHeader'
import ViewAllLink from '../shared/ViewAllLink'
import { useCartStore } from '../../store/cartStore'
import { listProducts, adaptProduct } from '../../api/product'
import ProductCard from './ProductCard'
import type { Product } from '../../types'

interface RelatedProps {
  categoryId?: string
  excludeId?: string
}

const Related: FC<RelatedProps> = ({ categoryId, excludeId }) => {
  const addItem = useCartStore((s) => s.addItem)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProducts({ categoryId, limit: 5 })
      .then(({ items }) => {
        const filtered = excludeId ? items.filter((p) => p.id !== excludeId) : items
        setProducts(filtered.slice(0, 4).map((p) => adaptProduct(p)))
      })
      .catch(() => {
        setProducts([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [categoryId, excludeId])

  if (loading || products.length === 0) return null

  return (
    <section className="page-section">
      <SectionHeader
        kicker="You may also like"
        title={
          <>
            محصولات <em>مشابه</em>
          </>
        }
        aside={<ViewAllLink href="/category/new">همه‌ی محصولات</ViewAllLink>}
      />
      <div className="products-grid cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={addItem} />
        ))}
      </div>
    </section>
  )
}

export default memo(Related)
