import { useEffect, useState, memo, type FC } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../product/ProductCard'
import { useCartStore } from '../../store/cartStore'
import SectionHeader from '../shared/SectionHeader'
import { listProducts, adaptProduct } from '../../api/product'
import { BTN_GHOST_CLS } from '../ui/Button'
import Icon from '../icons/Icon'
import type { Product } from '../../types'

const SKELETON_ITEMS = Array.from({ length: 8 }, (_, i) => (
  <div key={i} className="bg-surface border border-rule rounded-[var(--radius)] overflow-hidden flex flex-col opacity-50">
    <div className="aspect-square bg-surface-2" />
    <div className="px-4 pt-4 pb-5 flex flex-col gap-3">
      <div className="h-5 bg-surface-2 rounded w-3/4" />
      <div className="h-5 bg-surface-2 rounded" />
      <div className="max-h-0 overflow-hidden max-[720px]:max-h-[40px] rounded-full bg-surface-2" />
    </div>
  </div>
))

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
        aside={
          <Link to="/category/new" className={`${BTN_GHOST_CLS} self-end`}>
            مشاهده‌ی همه
            <span className="arr"><Icon name="arrow-left" size={16} /></span>
          </Link>
        }
      />
      <div className="products-grid cols-4">
        {loading
          ? SKELETON_ITEMS
          : products.map((product, i) => (
              <ProductCard key={product.id} product={product} onAdd={addItem} priority={i < 4} />
            ))
        }
      </div>
    </section>
  )
}

export default memo(ProductsSection)
