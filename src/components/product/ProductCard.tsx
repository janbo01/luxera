import { useRef, memo, type FC } from 'react'
import { Link } from 'react-router-dom'
import { Illustration } from '../../illustrations'
import { flyToCart } from '../../utils/flyToCart'
import { useWishlist } from '../../hooks/useWishlist'
import { formatNumber, toFa } from '../../utils/format'
import Icon from '../icons/Icon'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
}

const ProductCard: FC<ProductCardProps> = ({ product, onAdd }) => {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const { wishlisted, toggle } = useWishlist(product)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const mediaEl = cardRef.current?.querySelector('.product__media')
    if (mediaEl) flyToCart(mediaEl.getBoundingClientRect())
    onAdd(product)
  }

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle()
  }

  const badgeKind = product.badgeKind
  const badgeLabel = product.badge

  return (
    <Link className="product" ref={cardRef} to={`/product/${product.id}`}>
      <div className="product__media">
        {/* Badges */}
        {badgeLabel && (
          <div className="product__badges">
            <span className={`product__badge product__badge--${badgeKind ?? 'new'}`}>
              {badgeLabel}
            </span>
          </div>
        )}

        {/* Quick actions (wishlist) */}
        <div className="product__quick-actions">
          <button
            className={`product__wish${wishlisted ? ' is-active' : ''}`}
            aria-label={wishlisted ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'}
            onClick={handleWish}
          >
            <Icon name={wishlisted ? 'heart-filled' : 'heart'} size={16} strokeWidth={1.6} />
          </button>
        </div>

        {/* Product image or illustration */}
        <div className="product__media-frame">
          <div className="product__media-inner">
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.fa} loading="lazy" className="img-cover" />
              : <Illustration name={product.illus} />}
          </div>
        </div>

      </div>

      <div className="product__body">
        <div className="product__info">
          <div className="product__name">{product.fa}</div>
        </div>
        <div className="product__meta-row">
          <div className="product__price">
            {product.oldPrice && (
              <span className="product__price-old">{formatNumber(product.oldPrice)}</span>
            )}
            <span className="product__price-now">
              {formatNumber(product.price)}
              <small>تومان</small>
            </span>
          </div>
          <div className="product__rating">
            <Icon name="star" size={12} />
            <span>{toFa(4)}.{toFa(8)}</span>
          </div>
        </div>
        <button className="product__quick" onClick={handleAdd}>
          <span>افزودن به سبد</span>
          <Icon name="bag" size={16} strokeWidth={1.6} />
        </button>
      </div>
    </Link>
  )
}

export default memo(ProductCard)
