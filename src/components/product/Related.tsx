import { useState, useEffect, type FC } from 'react'
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
    <section className="related">
      <div className="related__head">
        <div className="titles">
          <span className="related__eyebrow">VOUS AIMEREZ AUSSI</span>
          <h2>شاید <em>دوست داشته باشید</em></h2>
        </div>
        <Link to="/" className="related__back-link">
          بازگشت به فروشگاه
          <Icon name="arrow-left" size={13} />
        </Link>
      </div>
      <div className="products">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={addItem} />
        ))}
      </div>
    </section>
  )
}

export default Related
