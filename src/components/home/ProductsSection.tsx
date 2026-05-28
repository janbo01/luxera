import { useEffect, useState, type FC } from 'react'
import ProductCard from '../product/ProductCard'
import { useCartStore } from '../../store/cartStore'
import SectionHeader from '../shared/SectionHeader'
import { listProducts, adaptProduct } from '../../api/product'
import type { Product } from '../../types'

const ProductsSection: FC = () => {
  const addItem = useCartStore((s) => s.addItem)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProducts({ limit: 8 })
      .then(({ items }) => setProducts(items.map((p) => adaptProduct(p))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="page-section" id="new">
      <SectionHeader
        kicker="NEW ARRIVALS · تازه‌ترین‌ها"
        title={<>جدیدترین <em>محصولات</em></>}
        aside={<a href="#all" className="inline-flex items-center gap-2.5 pb-1 border-b border-ink text-ink text-[13px] tracking-[0.04em] bg-transparent rounded-none transition-all duration-200 hover:text-plum hover:border-plum">مشاهده‌ی همه ←</a>}
      />
      <div className="products-grid cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-lg min-h-[300px] opacity-50" />
            ))
          : products.map((product, i) => (
              <ProductCard key={product.id} product={product} onAdd={addItem} priority={i < 4} />
            ))
        }
      </div>
    </section>
  )
}

export default ProductsSection
