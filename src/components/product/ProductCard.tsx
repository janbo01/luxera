import { useRef, useState, memo, useCallback, type FC } from 'react'

import { Illustration } from '../../illustrations'
import { flyToCart } from '../../utils/flyToCart'
import { useWishlist } from '../../hooks/useWishlist'
import { formatNumber } from '../../utils/format'
import { imgSet, imgUrl } from '../../utils/cdnImage'
import Icon from '../icons/Icon'
import Badge from '../shared/Badge'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
  priority?: boolean
}

const IMG_SIZES = '(max-width: 720px) 50vw, (max-width: 1100px) 33vw, 370px'

const ProductCard: FC<ProductCardProps> = ({ product, onAdd, priority = false }) => {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const { wishlisted, toggle } = useWishlist(product)
  // The second photo is only mounted after the first hover, so it never costs
  // a download for visitors who just scroll past.
  const [showAlt, setShowAlt] = useState(false)

  const handleMouseEnter = useCallback(() => {
    if (product.imageUrlAlt && !showAlt) {
      const img = new Image()
      img.src = imgUrl(product.imageUrlAlt, 640, 640)
      setShowAlt(true)
    }
  }, [product.imageUrlAlt, showAlt])

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const mediaEl = cardRef.current?.querySelector('.product-media')
      if (mediaEl) flyToCart(mediaEl.getBoundingClientRect())
      onAdd(product)
    },
    [onAdd, product],
  )

  const handleWish = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      toggle()
    },
    [toggle],
  )

  const badgeKind = product.badgeKind ?? 'new'
  const badgeLabel = product.badge
  const hasDiscount = product.oldPrice != null && product.oldPrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)
    : 0

  return (
    <a
      className="flex flex-col relative cursor-pointer min-w-0 group"
      ref={cardRef}
      href={`/product/${product.slug ?? product.id}`}
      onMouseEnter={handleMouseEnter}
    >
      {/* Media */}
      <div className="product-media relative bg-bg-2 aspect-square overflow-hidden rounded-[var(--radius)] ring-1 ring-inset ring-rule transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)]">
        {/* Badges */}
        {(badgeLabel || hasDiscount) && (
          <div className="product-badge absolute top-2.5 end-2.5 flex flex-col gap-1.5 items-end z-[3]">
            {badgeLabel && <Badge label={badgeLabel} kind={badgeKind} />}
            {hasDiscount && !badgeLabel && (
              <Badge label={`${formatNumber(discountPct)}٪`} kind="sale" />
            )}
          </div>
        )}

        {/* Wishlist — always visible on touch, revealed on hover/focus with a pointer */}
        <button
          className="absolute top-1 start-1 z-[3] w-11 h-11 grid place-items-center cursor-pointer transition-all duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:-translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 data-[on=true]:opacity-100 data-[on=true]:translate-y-0"
          aria-label={wishlisted ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'}
          aria-pressed={wishlisted}
          data-on={wishlisted}
          onClick={handleWish}
        >
          <span
            className={`w-[34px] h-[34px] rounded-full bg-surface/90 backdrop-blur-[8px] shadow-[var(--shadow-soft)] grid place-items-center transition-colors duration-200 ${wishlisted ? 'text-sale' : 'text-ink hover:text-sale'}`}
          >
            <Icon name={wishlisted ? 'heart-filled' : 'heart'} size={15} strokeWidth={1.7} />
          </span>
        </button>

        {/* Product image(s) */}
        <div className="absolute inset-0 flex items-center justify-center text-ink-2 [&>svg]:w-[60%] [&>svg]:h-auto transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.04]">
          {product.imageUrl ? (
            <>
              <img
                {...imgSet(product.imageUrl, {
                  widths: [320, 480, 640],
                  ratio: 1,
                  sizes: IMG_SIZES,
                })}
                alt={product.fa}
                width={640}
                height={640}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : 'auto'}
                decoding="async"
                className="w-full h-full object-cover"
              />
              {showAlt && product.imageUrlAlt && (
                <img
                  {...imgSet(product.imageUrlAlt, {
                    widths: [320, 480, 640],
                    ratio: 1,
                    sizes: IMG_SIZES,
                  })}
                  alt=""
                  aria-hidden="true"
                  width={640}
                  height={640}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <Illustration name={product.illus} />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="pt-3.5 px-0.5 flex flex-col gap-2.5 flex-1">
        <h3 className="font-heading text-[14.5px] sm:text-[15.5px] font-semibold leading-[1.45] text-ink m-0 line-clamp-2 min-h-[2.9em] transition-colors duration-200 group-hover:text-plum">
          {product.fa}
        </h3>

        <div className="flex justify-between items-center gap-2 mt-auto">
          <div className="flex flex-col items-start min-w-0 [font-feature-settings:'tnum']">
            {hasDiscount && (
              <span className="text-muted line-through text-[11px] font-mono leading-none mb-1">
                {formatNumber(product.oldPrice!)}
              </span>
            )}
            <span
              className={`font-heading text-[15.5px] sm:text-[17px] font-bold leading-none whitespace-nowrap ${hasDiscount ? 'text-sale' : 'text-ink'}`}
            >
              {formatNumber(product.price)}
              {Number.isFinite(product.price) && (
                <small className="text-[11px] font-normal text-muted me-1 font-body"> تومان</small>
              )}
            </span>
          </div>

          {/* Add to cart */}
          <button
            className="product-quick shrink-0 w-11 h-11 rounded-full grid place-items-center border border-rule bg-surface text-ink cursor-pointer transition-all duration-200 hover:bg-ink hover:text-bg hover:border-ink active:scale-95 group-hover:border-ink"
            onClick={handleAdd}
            aria-label={`افزودن ${product.fa} به سبد`}
          >
            <Icon name="bag" size={17} strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </a>
  )
}

export default memo(ProductCard)
