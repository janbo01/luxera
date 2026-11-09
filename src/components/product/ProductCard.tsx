import { useRef, useState, memo, useCallback, type FC } from 'react'

import { Illustration } from '../../illustrations'
import { flyToCart } from '../../utils/flyToCart'
import { useWishlist } from '../../hooks/useWishlist'
import { formatNumber } from '../../utils/format'
import { imgSet, imgUrl } from '../../utils/cdnImage'
import Icon from '../icons/Icon'
import Badge from '../shared/Badge'
import Stars from './Stars'
import { hexToSwatch } from '../../utils/colorSwatch'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
  priority?: boolean
}

const IMG_SIZES = '(max-width: 720px) 50vw, (max-width: 1100px) 33vw, 370px'

const ProductCard: FC<ProductCardProps> = ({ product, onAdd, priority = false }) => {
  const cardRef = useRef<HTMLElement>(null)
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

  const soldOut = product.stockCount === 0
  const lowStock = product.stockCount != null && product.stockCount > 0 && product.stockCount <= 5
  const swatches = product.colors?.slice(0, 4) ?? []
  const moreColors = (product.colors?.length ?? 0) - swatches.length

  const href = `/product/${product.slug ?? product.id}`

  // "Stretched link" card: the title's link covers the whole card via ::after, so the
  // wishlist / add-to-cart buttons can be real siblings instead of buttons nested inside
  // an <a> (invalid HTML that screen readers announce as one confusing control).
  return (
    <article
      className="flex flex-col relative min-w-0 group"
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
    >
      {/* Media */}
      <div className="product-media relative bg-bg-2 aspect-square overflow-hidden rounded-[var(--radius)] ring-1 ring-inset ring-rule transition-shadow duration-300 group-hover:shadow-[var(--shadow-lift)] group-has-[a:focus-visible]:ring-2 group-has-[a:focus-visible]:ring-plum">
        {/* Badges */}
        {(badgeLabel || hasDiscount) && (
          <div className="product-badge absolute top-2.5 end-2.5 flex flex-col gap-1.5 items-end z-[3] pointer-events-none">
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

        {/* Add to cart — floats on the photo corner so the price can sit right under the title */}
        {!soldOut && (
          <button
            className="product-quick absolute bottom-1 end-1 z-[3] min-w-11 h-11 grid place-items-center cursor-pointer"
            onClick={handleAdd}
            aria-label={`افزودن ${product.fa} به سبد`}
          >
            <span className="h-9 min-w-9 rounded-full inline-flex items-center justify-center gap-1.5 bg-surface/90 backdrop-blur-[8px] text-ink shadow-[var(--shadow-soft)] transition-all duration-200 group-hover:bg-ink group-hover:text-bg active:scale-90 [@media(hover:none)]:px-3">
              <Icon name="bag" size={16} strokeWidth={1.7} />
              {/* Touch screens have no hover to explain a bare icon, so they get a word */}
              <span className="hidden [@media(hover:none)]:inline text-[12.5px] font-medium">
                افزودن
              </span>
            </span>
          </button>
        )}
        {soldOut && (
          <span className="absolute bottom-2.5 start-2.5 z-[3] pointer-events-none rounded-full bg-surface/90 px-3 py-1 text-[12px] text-ink-2 backdrop-blur-[8px]">
            ناموجود
          </span>
        )}
      </div>

      {/* Body */}
      <div className="pt-3 px-0.5 flex flex-col gap-2 flex-1">
        {/* Titles are body text, not display: Yekan Bakh stays legible over two lines at
            small sizes where the Morabba display face turned into a dense block. */}
        <h3 className="font-body text-[14.5px] sm:text-[15.5px] font-medium leading-[1.6] text-ink m-0 line-clamp-2 transition-colors duration-200 group-hover:text-plum">
          <a
            href={href}
            className="outline-none after:absolute after:inset-0 after:z-[1] after:content-['']"
          >
            {product.fa}
          </a>
        </h3>

        {(product.rating != null || swatches.length > 0) && (
          <div className="flex items-center justify-between gap-2 min-h-5">
            {product.rating != null ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                <span className="text-copper">
                  <Stars value={product.rating} size={12} />
                </span>
                <span className="[font-feature-settings:'tnum']">
                  ({formatNumber(product.reviewCount ?? 0)})
                </span>
              </span>
            ) : (
              <span />
            )}
            {swatches.length > 0 && (
              <span
                className="inline-flex items-center gap-1"
                role="list"
                aria-label="رنگ‌های موجود"
              >
                {swatches.map((c) => (
                  <span
                    key={c.id}
                    role="listitem"
                    title={c.name}
                    aria-label={c.name}
                    className="w-3.5 h-3.5 rounded-full ring-1 ring-inset ring-ink/20"
                    style={{ background: hexToSwatch(c.hex) }}
                  />
                ))}
                {moreColors > 0 && (
                  <span className="text-[11px] text-muted ms-0.5">+{formatNumber(moreColors)}</span>
                )}
              </span>
            )}
          </div>
        )}

        <div className="flex items-baseline gap-2 flex-wrap mt-auto [font-feature-settings:'tnum']">
          <span
            className={`font-heading text-[16px] sm:text-[17.5px] font-bold leading-none whitespace-nowrap ${hasDiscount ? 'text-sale' : 'text-ink'}`}
          >
            {formatNumber(product.price)}
            {Number.isFinite(product.price) && (
              <small className="text-[12.5px] font-normal text-muted ms-1 font-body">تومان</small>
            )}
          </span>
          {hasDiscount && (
            <span className="text-muted line-through text-[13px] leading-none">
              <span className="sr-only">قیمت قبلی: </span>
              {formatNumber(product.oldPrice!)}
            </span>
          )}
        </div>
        {lowStock && (
          <span className="text-[12px] font-medium text-copper-dark" role="status">
            تنها {formatNumber(product.stockCount!)} عدد باقی مانده
          </span>
        )}
      </div>
    </article>
  )
}

export default memo(ProductCard)
