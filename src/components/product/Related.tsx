import { useState, useEffect, memo, type FC } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../icons/Icon'
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
        const filtered = excludeId
          ? items.filter((p) => p.id !== excludeId)
          : items
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
    <section className="py-[80px] px-[var(--pad)]">
      <div className="flex items-end justify-between gap-8 mb-8">
        <div className="flex flex-col gap-2">
          <span className="font-display italic text-[18px] text-copper-dark tracking-[0.04em]">VOUS AIMEREZ AUSSI</span>
          <h2 className="font-heading font-bold leading-[1.1] m-0 text-[clamp(38px,3.4vw,52px)] text-ink">
            شاید <em className="font-body italic font-normal text-copper-dark">دوست داشته باشید</em>
          </h2>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[13px] px-[18px] py-[11px] rounded-full border border-rule text-ink-2 transition-all duration-200 hover:bg-ink hover:text-bg hover:border-ink flex-shrink-0"
        >
          بازگشت به فروشگاه
          <Icon name="arrow-left" size={13} />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-[18px] max-md:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={addItem} />
        ))}
      </div>
    </section>
  )
}

export default memo(Related)
