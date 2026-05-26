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
    <section className="section" id="new">
      <SectionHeader
        kicker="NEW ARRIVALS · تازه‌ترین‌ها"
        title={<>جدیدترین <em>محصولات</em></>}
        aside={<a href="#all" className="btn--link">مشاهده‌ی همه ←</a>}
      />
      {loading ? (
        <div className="products">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product" style={{ background: 'var(--surface)', borderRadius: 8, minHeight: 300, opacity: 0.5 }} />
          ))}
        </div>
      ) : (
        <div className="products">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={addItem} />
          ))}
        </div>
      )}
    </section>
  )
}

export default ProductsSection
