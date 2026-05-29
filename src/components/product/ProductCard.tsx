import { useRef, memo, useCallback, type FC } from 'react'
import { Link } from 'react-router-dom'
import { Illustration } from '../../illustrations'
import { flyToCart } from '../../utils/flyToCart'
import { useWishlist } from '../../hooks/useWishlist'
import { formatNumber, toFa } from '../../utils/format'
import Icon from '../icons/Icon'
import Badge from '../shared/Badge'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
  priority?: boolean
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

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const mediaEl = cardRef.current?.querySelector('.product-media')
    if (mediaEl) flyToCart(mediaEl.getBoundingClientRect())
    onAdd(product)
  }, [onAdd, product])

  const handleWish = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle()
  }, [toggle])

  const badgeKind = product.badgeKind ?? 'new'
  const badgeLabel = product.badge

  return (
    <Link
      className="bg-surface border border-rule rounded-[var(--radius)] overflow-hidden flex flex-col relative cursor-pointer min-w-0 card-lift group"
      ref={cardRef}
      to={`/product/${product.id}`}
      onMouseEnter={handleMouseEnter}
    >
      {/* Media */}
      <div className="product-media relative bg-gradient-to-br from-[#EFE5D5] to-[#E6D8C2] aspect-square overflow-hidden">

        {/* Badges */}
        {badgeLabel && (
          <div className="product-badge absolute top-3 end-3 flex flex-col gap-1.5 items-end z-[3]">
            <Badge label={badgeLabel} kind={badgeKind} />
          </div>
        )}

        {/* Quick actions (wishlist) */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5 z-[3] opacity-0 -translate-x-[6px] transition-all duration-[250ms] group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0 max-[720px]:opacity-100 max-[720px]:translate-x-0">
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
      <div className="px-4 pt-4 pb-5 flex flex-col gap-3">
        <div className="font-heading text-[16px] font-semibold leading-[1.3] text-ink">{product.fa}</div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col items-start [font-feature-settings:'tnum']">
            {product.oldPrice && (
              <span className="text-muted line-through text-[11px] font-mono leading-none mb-1">{formatNumber(product.oldPrice)}</span>
            )}
            <span className="font-heading text-[17px] font-bold text-ink leading-none">
              {formatNumber(product.price)}
              <small className="text-[11px] font-normal text-muted me-1 font-body"> تومان</small>
            </span>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-ink-2 font-mono pb-px">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-copper shrink-0"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span>{toFa(4)}.{toFa(8)}</span>
          </div>
        </div>

        {/* Add to cart — expands on hover/focus/touch */}
        <button
          className="product-quick flex justify-between items-center w-full bg-ink text-bg rounded-full text-[12px] font-medium font-[inherit] border-none cursor-pointer max-h-0 overflow-hidden opacity-0 px-4 py-0 mt-0 transition-[max-height,opacity,padding,margin] duration-[250ms] ease-in-out group-hover:max-h-[40px] group-hover:opacity-100 group-hover:py-2.5 group-focus-within:max-h-[40px] group-focus-within:opacity-100 group-focus-within:py-2.5 max-[720px]:max-h-[40px] max-[720px]:opacity-100 max-[720px]:py-2.5 hover:bg-plum [&>svg]:w-3.5 [&>svg]:h-3.5"
          onClick={handleAdd}
          aria-label="افزودن به سبد"
        >
          <span>افزودن به سبد</span>
          <Icon name="bag" size={15} strokeWidth={1.6} />
        </button>
      </div>
    </Link>
  )
}

export default memo(ProductCard)
