import { useRef, memo, useCallback, type FC } from 'react'
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
  priority?: boolean
}

const BADGE_CLASS: Record<string, string> = {
  sale:    'bg-sale text-white',
  new:     'bg-plum text-white',
  limited: 'bg-gold text-ink',
}

const ProductCard: FC<ProductCardProps> = ({ product, onAdd, priority = false }) => {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const { wishlisted, toggle } = useWishlist(product)

  const handleMouseEnter = useCallback(() => {
    if (product.imageUrlAlt) {
      const img = new Image()
      img.src = product.imageUrlAlt
    }
  }, [product.imageUrlAlt])

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const mediaEl = cardRef.current?.querySelector('.product-media')
    if (mediaEl) flyToCart(mediaEl.getBoundingClientRect())
    onAdd(product)
  }

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle()
  }

  const badgeKind = product.badgeKind ?? 'new'
  const badgeLabel = product.badge

  return (
    <Link
      className="bg-surface rounded-[14px] overflow-hidden flex flex-col relative cursor-pointer min-w-0 card-lift group"
      ref={cardRef}
      to={`/product/${product.id}`}
      onMouseEnter={handleMouseEnter}
    >
      {/* Media */}
      <div className="product-media relative bg-gradient-to-br from-[#EFE5D5] to-[#E6D8C2] aspect-square overflow-hidden">

        {/* Badges */}
        {badgeLabel && (
          <div className="product-badge absolute top-3 end-3 flex flex-col gap-1.5 items-end z-[3]">
            <span className={`font-mono text-[10px] tracking-[0.14em] uppercase px-[9px] py-[5px] rounded-[4px] font-medium ${BADGE_CLASS[badgeKind] ?? 'bg-plum text-white'}`}>
              {badgeLabel}
            </span>
          </div>
        )}

        {/* Quick actions (wishlist) */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5 z-[3] opacity-0 -translate-x-[6px] transition-all duration-[250ms] group-hover:opacity-100 group-hover:translate-x-0">
          <button
            className={`w-[34px] h-[34px] rounded-full bg-[rgba(251,246,238,0.92)] backdrop-blur-[8px] grid place-items-center transition-colors duration-200 border-none cursor-pointer [&>svg]:w-3.5 [&>svg]:h-3.5 ${wishlisted ? 'bg-white text-sale' : 'text-ink hover:bg-white hover:text-sale'}`}
            aria-label={wishlisted ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'}
            onClick={handleWish}
          >
            <Icon name={wishlisted ? 'heart-filled' : 'heart'} size={16} strokeWidth={1.6} />
          </button>
        </div>

        {/* Product image */}
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out group-hover:scale-[1.04]">
          <div className="absolute inset-0 flex items-center justify-center text-ink-2 [&>svg]:w-[60%] [&>svg]:h-auto transition-opacity duration-500">
            {product.imageUrl
              ? <img
                  src={product.imageUrl}
                  alt={product.fa}
                  loading={priority ? 'eager' : 'lazy'}
                  fetchPriority={priority ? 'high' : 'auto'}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              : <Illustration name={product.illus} />}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-[18px] pb-[22px] flex flex-col gap-1.5">
        <div className="flex flex-col gap-0.5">
          <div className="font-heading text-[17px] font-semibold leading-[1.3] text-ink">{product.fa}</div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex flex-col items-start [font-feature-settings:'tnum']">
            {product.oldPrice && (
              <span className="text-muted line-through text-[11px] font-mono">{formatNumber(product.oldPrice)}</span>
            )}
            <span className="font-heading text-lg font-bold text-ink">
              {formatNumber(product.price)}
              <small className="text-[11px] font-normal text-muted me-1 font-body"> تومان</small>
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted font-mono [&>svg]:w-3 [&>svg]:h-3 [&>svg]:text-copper">
            <Icon name="star" size={12} />
            <span>{toFa(4)}.{toFa(8)}</span>
          </div>
        </div>

        {/* Add to cart — expands on hover */}
        <button
          className="product-quick flex justify-between items-center w-full bg-[rgba(27,15,29,0.94)] text-bg rounded-[8px] text-[13px] font-medium font-[inherit] border-none cursor-pointer max-h-0 overflow-hidden opacity-0 px-3.5 py-0 mt-0 transition-[max-height,opacity,padding,margin] duration-[250ms] ease-in-out group-hover:max-h-[44px] group-hover:opacity-100 group-hover:py-2.5 group-hover:mt-2 hover:bg-plum [&>svg]:w-3.5 [&>svg]:h-3.5"
          onClick={handleAdd}
        >
          <span>افزودن به سبد</span>
          <Icon name="bag" size={16} strokeWidth={1.6} />
        </button>
      </div>
    </Link>
  )
}

export default memo(ProductCard)
