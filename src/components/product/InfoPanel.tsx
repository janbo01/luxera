import { useState, type FC } from 'react'
import Icon from '../icons/Icon'
import QuantityStepper from '../shared/QuantityStepper'
import Stars from './Stars'
import { formatToman, formatNumber, toFa } from '../../utils/format'
import { useWishlist } from '../../hooks/useWishlist'
import { useVariantSelector } from '../../hooks/useVariantSelector'
import { hexToSwatch } from '../../utils/colorSwatch'
import { StockNotifyForm } from './StockNotifyForm'
import { ShareRow } from './ShareRow'
import type { Product, ProductDetail } from '../../types'
import type { ApiProductColor, ApiProductSize, ApiProductVariant } from '../../api/product'

interface InfoPanelProps {
  product: ProductDetail
  apiColors?: ApiProductColor[]
  apiSizes?: ApiProductSize[]
  apiVariants?: ApiProductVariant[]
  onAdd: (product: Product) => void
  onSizeGuide: () => void
}

const PERKS = [
  {
    icon: 'spark',
    heading: 'اصالت و کیفیت',
    body: 'آلیاژ بدون نیکل با روکش ماندگار، ایمن برای پوست حساس',
  },
  {
    icon: 'bag',
    heading: 'ارسال رایگان بالای ۲.۵ میلیون',
    body: 'تهران: ۴–۶ ساعت · سراسر ایران: ۲–۵ روز کاری',
  },
  { icon: 'globe', heading: 'بازگشتِ ۴ روزه', body: 'تا ۴ روز پس از دریافت، با بسته‌بندی اصلی' },
]

const SWATCH_BG: Record<string, string> = {
  gold: 'bg-[linear-gradient(135deg,#E6C384,#B58A47)]',
  rose: 'bg-[linear-gradient(135deg,#EDC9B6,#C18876)]',
  white: 'bg-[linear-gradient(135deg,#DCDCDC,#A8A8AA)]',
}

const InfoPanel: FC<InfoPanelProps> = ({
  product: p,
  apiColors,
  apiSizes,
  apiVariants,
  onAdd,
  onSizeGuide,
}) => {
  const {
    color,
    setColor,
    colorOptions,
    selectedColor,
    setSize,
    sizeOptions,
    selectedSize,
    effectiveSize,
    variantQuantity,
    outOfStock,
  } = useVariantSelector(apiColors, apiSizes, apiVariants)

  const effectiveStock = variantQuantity ?? p.stockCount
  const [qty, setQty] = useState(1)
  const { wishlisted, toggle } = useWishlist(p)

  const discountPct = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0

  const handleAdd = () => {
    const safeQty = Math.min(qty, effectiveStock)
    for (let i = 0; i < safeQty; i++) onAdd({ ...p, stockCount: effectiveStock })
  }

  return (
    <aside className="flex flex-col px-1.5 pt-2">
      {/* Category + SKU */}
      <div className="flex items-center justify-between gap-3.5 mb-[18px]">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-copper-dark inline-flex items-center gap-2 before:block before:w-[18px] before:h-px before:bg-current before:opacity-60">
          {p.cat || 'جواهرات'}
        </span>
        <span className="font-mono text-[10px] text-muted tracking-[0.16em]">
          LUX-{p.id.slice(0, 6).toUpperCase()}
        </span>
      </div>

      {/* Product name */}
      <h1 className="font-heading font-bold leading-[1.05] tracking-[-0.01em] text-[clamp(32px,3.2vw,48px)] m-0 text-ink">
        {p.fa}
        <span className="block font-display italic font-normal text-[18px] text-copper-dark mt-2 tracking-[0.02em]">
          {p.en}
        </span>
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-3.5 mt-[18px] pb-[22px] border-b border-rule text-[12px] text-muted">
        <Stars value={p.rating} size={14} />
        <span className="font-mono text-[13px] text-ink">{toFa(p.rating.toFixed(1))}</span>
        <span className="w-[3px] h-[3px] rounded-full bg-rule flex-shrink-0" />
        <a
          href="#reviews"
          className="inline-flex items-center gap-1 min-h-[48px] text-muted font-mono tracking-[0.04em] text-[12px] hover:text-ink transition-colors duration-200"
        >
          <b className="text-ink font-semibold">{toFa(p.reviewCount)}</b> نظر
        </a>
      </div>

      {/* Price block */}
      <div className="mt-[22px] flex flex-col gap-1">
        {p.oldPrice && (
          <div className="inline-flex items-center gap-2.5">
            <span className="text-[18px] line-through text-muted font-mono">
              {formatToman(p.oldPrice)}
            </span>
            <span className="px-2 py-[2px] bg-sale text-white rounded-[4px] text-[10px] tracking-[0.1em] font-mono">
              {toFa(discountPct)}٪ تخفیف
            </span>
          </div>
        )}
        <span className="font-heading text-[38px] font-bold text-ink leading-none mt-3.5 flex items-baseline gap-2">
          {formatNumber(p.price)}
          <small className="font-body text-[13px] font-normal text-muted">تومان</small>
        </span>
        {p.oldPrice && (
          <span className="text-[12px] text-ok font-mono tracking-[0.04em] mt-0.5">
            شما {formatToman(p.oldPrice - p.price)} تومان صرفه‌جویی می‌کنید
          </span>
        )}
      </div>

      {/* Color selector */}
      {colorOptions.length > 0 && (
        <div className="mt-[26px]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[13px] text-ink font-medium flex items-center gap-2">
              <b className="font-heading font-semibold">رنگ:</b>
              <span className="text-copper-dark font-body italic text-[14px]">
                {selectedColor?.fa}
              </span>
            </span>
          </div>
          <div className="flex gap-2.5 items-center flex-wrap">
            {colorOptions.map((c) => (
              <button
                key={c.id}
                className={`w-[48px] h-[48px] rounded-full cursor-pointer border-2 relative grid place-items-center transition-transform duration-150 hover:scale-[1.06] p-0 bg-transparent flex-shrink-0 ${c.id === color ? 'border-ink' : 'border-transparent'} ${c.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                style={
                  c.hex ? ({ '--swatch': hexToSwatch(c.hex) } as React.CSSProperties) : undefined
                }
                onClick={() => !c.disabled && setColor(c.id)}
                aria-label={c.fa}
              >
                <span
                  className={`absolute inset-[3px] rounded-full ${!c.hex ? (SWATCH_BG[c.swatch] ?? '') : ''}`}
                  style={c.hex ? { background: `var(--swatch, ${c.hex})` } : undefined}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      <div className="mt-[26px]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[13px] text-ink font-medium flex items-center gap-2">
            <b className="font-heading font-semibold">طول زنجیر:</b>
            <span className="text-copper-dark font-body italic text-[14px]">
              {selectedSize?.label} سانتی‌متر
            </span>
          </span>
          <button
            className="inline-flex items-center min-h-[48px] text-[11px] text-muted underline underline-offset-[3px] font-body tracking-[0.04em] cursor-pointer transition-colors duration-200 hover:text-copper"
            onClick={onSizeGuide}
          >
            راهنمای سایز
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {sizeOptions.map((s) => (
            <button
              key={s.id}
              className={`min-w-[54px] min-h-[48px] px-3.5 inline-flex items-center justify-center border rounded-[10px] font-body text-[13px] transition-all duration-150 text-center ${s.id === effectiveSize ? 'bg-ink text-bg border-ink' : 'bg-surface border-rule hover:border-ink-2'} ${s.disabled ? 'opacity-[0.35] cursor-not-allowed line-through' : 'cursor-pointer'}`}
              disabled={s.disabled}
              onClick={() => !s.disabled && setSize(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Low stock indicator */}
      {effectiveStock > 0 && effectiveStock <= 5 && !outOfStock && (
        <p className="mt-3.5 text-[12px] text-sale flex items-center gap-2 m-0" role="status">
          <span
            className="w-[7px] h-[7px] rounded-full bg-sale flex-shrink-0 animate-[pdp-pulse_1.6s_infinite]"
            aria-hidden="true"
          />
          تنها <b>{toFa(effectiveStock)} عدد</b> در انبار باقی مانده — احتمال اتمام به‌زودی
        </p>
      )}

      {/* Cart / out-of-stock area */}
      {outOfStock ? (
        <div className="mb-3 mt-[22px]">
          <StockNotifyForm productId={p.id} />
        </div>
      ) : (
        <div className="flex gap-2.5 mt-[22px] items-stretch">
          <QuantityStepper
            value={qty}
            onDecrement={() => setQty(Math.max(1, qty - 1))}
            onIncrement={() => setQty(Math.min(effectiveStock, qty + 1))}
            className="inline-flex items-center bg-surface border border-rule rounded-full p-1 [&>button]:w-[48px] [&>button]:h-[48px] [&>button]:rounded-full [&>button]:grid [&>button]:place-items-center [&>button]:text-ink [&>button]:transition-colors [&>button]:duration-200 hover:[&>button]:bg-bg-2 [&>span]:min-w-8 [&>span]:text-center [&>span]:font-body [&>span]:font-medium [&>span]:text-[14px]"
          />
          <button
            className="flex-1 bg-plum text-bg px-[26px] flex items-center justify-between rounded-full transition-colors duration-200 hover:bg-plum-2 min-h-[52px]"
            onClick={handleAdd}
          >
            <span className="font-medium text-[14px] inline-flex items-center gap-2.5">
              <Icon name="bag" size={16} />
              افزودن به سبد
            </span>
            <span className="font-body text-[13px] opacity-90">
              {formatNumber(p.price * qty)} ت
            </span>
          </button>
        </div>
      )}

      {/* Wishlist */}
      <button
        className={`mt-2.5 flex items-center gap-2 py-[13px] px-[18px] bg-surface border rounded-full text-[13px] w-full justify-center transition-all duration-200 font-body ${wishlisted ? 'border-plum text-plum' : 'border-rule text-ink-2 hover:border-ink hover:bg-bg'}`}
        onClick={toggle}
      >
        <Icon name={wishlisted ? 'heart-filled' : 'heart'} size={15} />
        {wishlisted ? 'در علاقه‌مندی‌ها ذخیره شد' : 'افزودن به علاقه‌مندی‌ها'}
      </button>

      <ShareRow productName={p.fa} />

      {/* Perks */}
      <div className="mt-[22px] flex flex-col gap-3">
        {PERKS.map(({ icon, heading, body }) => (
          <div
            key={icon}
            className="flex items-start gap-3.5 p-3.5 bg-surface rounded-[12px] border border-rule"
          >
            <span className="w-9 h-9 rounded-[8px] bg-bg-2 grid place-items-center text-copper flex-shrink-0">
              <Icon name={icon} size={17} />
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-heading text-[13px] font-semibold leading-[1.3] text-ink">
                {heading}
              </span>
              <span className="text-[11px] text-muted leading-[1.5]">{body}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default InfoPanel
