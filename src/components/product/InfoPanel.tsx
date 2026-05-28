import { useState, useRef, useMemo, type FC } from 'react'
import Icon from '../icons/Icon'
import { IconTelegram, IconWhatsApp } from '../icons/BrandIcons'
import Stars from './Stars'
import { formatToman, formatNumber, toFa, normalizePhoneInput } from '../../utils/format'
import { SIZE_OPTIONS, COLOR_OPTIONS } from '../../data/productDetail'
import { useWishlist } from '../../hooks/useWishlist'
import { subscribeStockNotification } from '../../api/product'
import { toE164 } from '../../api/user'
import { hexToSwatch } from '../../utils/colorSwatch'
import type { Product, ProductDetail, ColorOption, SizeOption } from '../../types'
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
  { icon: 'spark', heading: 'ضمانت گرید یک‌ساله', body: 'تعویض رایگان در صورت بروز خدشه و فرسایش' },
  { icon: 'bag',   heading: 'ارسالِ رایگان در ۲۴ ساعت', body: 'تهران: ۴–۶ ساعت · سراسر ایران: ۲۴–۷۲ ساعت' },
  { icon: 'globe', heading: 'بازگشتِ ۱۴ روزه', body: 'بدون پرسش، با بسته‌بندی اصلی' },
]

const SHARE_TEXT = (name: string) =>
  `${name} | لوکسرا\n${typeof window !== 'undefined' ? window.location.href : ''}`

function apiColorsToOptions(apiColors: ApiProductColor[]): ColorOption[] {
  const swatches = ['gold', 'rose', 'white'] as const
  return apiColors.map((c, i) => ({
    id: c.id,
    fa: c.name,
    swatch: swatches[i % swatches.length],
    hex: c.hex_code,
  }))
}

function apiSizesToOptions(apiSizes: ApiProductSize[]): SizeOption[] {
  return apiSizes.map((s) => ({
    id: s.id,
    label: s.value,
    disabled: false,
  }))
}

const SWATCH_BG: Record<string, string> = {
  gold:  'bg-[linear-gradient(135deg,#E6C384,#B58A47)]',
  rose:  'bg-[linear-gradient(135deg,#EDC9B6,#C18876)]',
  white: 'bg-[linear-gradient(135deg,#DCDCDC,#A8A8AA)]',
}

const SHARE_BTN = 'w-8 h-8 rounded-full border border-rule grid place-items-center text-ink-2 transition-all duration-200 hover:bg-ink hover:text-bg hover:border-ink'

const InfoPanel: FC<InfoPanelProps> = ({ product: p, apiColors, apiSizes, apiVariants, onAdd, onSizeGuide }) => {
  const hasVariants = apiVariants && apiVariants.length > 0

  const allColorOptions: ColorOption[] = useMemo(
    () => (apiColors && apiColors.length > 0 ? apiColorsToOptions(apiColors) : COLOR_OPTIONS),
    [apiColors],
  )

  const allSizeOptions: SizeOption[] = useMemo(
    () => (apiSizes && apiSizes.length > 0 ? apiSizesToOptions(apiSizes) : SIZE_OPTIONS),
    [apiSizes],
  )

  const [color, setColor] = useState(allColorOptions[0]?.id ?? 'gold')
  const [size, setSize] = useState(
    allSizeOptions.find((s) => !s.disabled)?.id ?? allSizeOptions[0]?.id ?? '45',
  )
  const [qty, setQty] = useState(1)

  const colorOptions: ColorOption[] = useMemo(() => {
    if (!hasVariants) return allColorOptions
    const activeVariants = apiVariants!.filter((v) => v.quantity > 0)
    const validColorIds = new Set(activeVariants.map((v) => v.color_id).filter(Boolean))
    return allColorOptions.map((c) => ({
      ...c,
      disabled: !validColorIds.has(c.id),
    }))
  }, [hasVariants, apiVariants, allColorOptions])

  const sizeOptions: SizeOption[] = useMemo(() => {
    if (!hasVariants) return allSizeOptions
    const relevantVariants = apiVariants!.filter(
      (v) => v.quantity > 0 && (v.color_id === color || v.color_id === null),
    )
    const validSizeIds = new Set(relevantVariants.map((v) => v.size_id).filter(Boolean))
    return allSizeOptions.map((s) => ({
      ...s,
      disabled: validSizeIds.size > 0 ? !validSizeIds.has(s.id) : s.disabled,
    }))
  }, [hasVariants, apiVariants, allSizeOptions, color])

  const selectedSizeAvailable = sizeOptions.find((s) => s.id === size && !s.disabled)
  const effectiveSize = selectedSizeAvailable
    ? size
    : sizeOptions.find((s) => !s.disabled)?.id ?? size

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null
    return (
      apiVariants!.find((v) => v.color_id === color && v.size_id === effectiveSize) ??
      apiVariants!.find((v) => v.color_id === color && v.size_id === null) ??
      apiVariants!.find((v) => v.color_id === null && v.size_id === effectiveSize) ??
      null
    )
  }, [hasVariants, apiVariants, color, effectiveSize])

  const variantStock = hasVariants ? (selectedVariant?.quantity ?? 0) : p.stockCount

  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifyPhone, setNotifyPhone] = useState('')
  const [notifyError, setNotifyError] = useState('')
  const [notifySubmitting, setNotifySubmitting] = useState(false)
  const [notifyDone, setNotifyDone] = useState(false)
  const phoneInputRef = useRef<HTMLInputElement>(null)

  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { wishlisted, toggle } = useWishlist(p)

  const selectedSize = sizeOptions.find((s) => s.id === effectiveSize)
  const outOfStock = hasVariants ? variantStock === 0 : (selectedSize?.disabled ?? false)
  const selectedColor = colorOptions.find((c) => c.id === color)

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) onAdd(p)
  }

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^9\d{9}$/.test(notifyPhone)) {
      setNotifyError('شماره موبایل معتبر نیست')
      return
    }
    setNotifyError('')
    setNotifySubmitting(true)
    try {
      await subscribeStockNotification(p.id, toE164(notifyPhone))
      setNotifyDone(true)
    } catch {
      setNotifyError('خطا در ثبت درخواست')
    } finally {
      setNotifySubmitting(false)
    }
  }

  const openNotify = () => {
    setNotifyOpen(true)
    setTimeout(() => phoneInputRef.current?.focus(), 50)
  }

  const showToast = () => {
    setToastVisible(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 2500)
  }

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: `${p.fa} — Luxera`, text: `${p.fa} را در لوکسرا ببینید`, url: window.location.href })
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = window.location.href
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    showToast()
  }

  const handleTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(p.fa + ' | لوکسرا')}`,
      '_blank', 'noopener,noreferrer',
    )
  }

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT(p.fa))}`,
      '_blank', 'noopener,noreferrer',
    )
  }

  const discountPct = p.oldPrice
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : 0

  return (
    <aside className="flex flex-col px-1.5 pt-2">
      {/* Category + SKU */}
      <div className="flex items-center justify-between gap-3.5 mb-[18px]">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-copper-dark inline-flex items-center gap-2 before:block before:w-[18px] before:h-px before:bg-current before:opacity-60">
          {p.cat || 'جواهرات'}
        </span>
        <span className="font-mono text-[10px] text-muted tracking-[0.16em]">LUX-{p.id.slice(0, 6).toUpperCase()}</span>
      </div>

      {/* Product name */}
      <h1 className="font-heading font-bold leading-[1.05] tracking-[-0.01em] text-[clamp(38px,3.8vw,56px)] m-0 text-ink">
        {p.fa}
        <span className="block font-display italic font-normal text-[18px] text-copper-dark mt-2 tracking-[0.02em]">{p.en}</span>
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-3.5 mt-[18px] pb-[22px] border-b border-rule text-[12px] text-muted">
        <Stars value={p.rating} size={14} />
        <span className="font-mono text-[13px] text-ink">{toFa(p.rating.toFixed(1))}</span>
        <span className="w-[3px] h-[3px] rounded-full bg-rule flex-shrink-0" />
        <a href="#reviews" className="text-muted font-mono tracking-[0.04em] text-[12px] hover:text-ink transition-colors duration-200">
          <b className="text-ink font-semibold">{toFa(p.reviewCount)}</b> نظر
        </a>
      </div>

      {/* Price block */}
      <div className="mt-[22px] flex flex-col gap-1">
        {p.oldPrice && (
          <div className="inline-flex items-center gap-2.5">
            <span className="text-[18px] line-through text-muted font-mono">{formatToman(p.oldPrice)}</span>
            <span className="px-2 py-[2px] bg-sale text-white rounded-[4px] text-[10px] tracking-[0.1em] font-mono">{toFa(discountPct)}٪ تخفیف</span>
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
              <span className="text-copper-dark font-body italic text-[14px]">{selectedColor?.fa}</span>
            </span>
          </div>
          <div className="flex gap-2.5 items-center flex-wrap">
            {colorOptions.map((c) => (
              <button
                key={c.id}
                className={`w-[38px] h-[38px] rounded-full cursor-pointer border-2 relative grid place-items-center transition-transform duration-150 hover:scale-[1.06] p-0 bg-transparent flex-shrink-0 ${c.id === color ? 'border-ink' : 'border-transparent'} ${c.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                style={c.hex ? { '--swatch': hexToSwatch(c.hex) } as React.CSSProperties : undefined}
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
            <span className="text-copper-dark font-body italic text-[14px]">{selectedSize?.label} سانتی‌متر</span>
          </span>
          <button
            className="text-[11px] text-muted underline underline-offset-[3px] font-body tracking-[0.04em] cursor-pointer transition-colors duration-200 hover:text-copper"
            onClick={onSizeGuide}
          >
            راهنمای سایز
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {sizeOptions.map((s) => (
            <button
              key={s.id}
              className={`min-w-[54px] px-3.5 py-[11px] border rounded-[10px] font-body text-[13px] transition-all duration-150 text-center ${s.id === effectiveSize ? 'bg-ink text-bg border-ink' : 'bg-surface border-rule hover:border-ink-2'} ${s.disabled ? 'opacity-[0.35] cursor-not-allowed line-through' : 'cursor-pointer'}`}
              disabled={s.disabled}
              onClick={() => !s.disabled && setSize(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Low stock indicator */}
      {variantStock > 0 && variantStock <= 5 && !outOfStock && (
        <p className="mt-3.5 text-[12px] text-sale flex items-center gap-2 m-0" role="status">
          <span className="w-[7px] h-[7px] rounded-full bg-sale flex-shrink-0 animate-[pdp-pulse_1.6s_infinite]" aria-hidden="true" />
          تنها <b>{toFa(variantStock)} عدد</b> در انبار باقی مانده — احتمال اتمام به‌زودی
        </p>
      )}

      {/* Cart / out-of-stock area */}
      {outOfStock ? (
        <div className="mb-3 mt-[22px]">
          {notifyDone ? (
            <p className="text-center text-[14px] text-plum font-medium p-3.5 border border-rule animate-[luxera-rise_300ms_cubic-bezier(.2,.7,.2,1)_both] m-0" role="status">
              ✓ اطلاع خواهیم داد!
            </p>
          ) : notifyOpen ? (
            <form className="p-4 bg-surface border border-rule rounded-[10px] flex flex-col gap-2.5" id="notify-form" onSubmit={handleNotifySubmit} noValidate>
              <p className="text-[13px] text-muted m-0">شماره موبایل را وارد کنید تا اطلاع دهیم</p>
              <div className="flex gap-2 items-stretch">
                <div className="flex-1 flex items-center border border-rule rounded-[8px] bg-surface overflow-hidden focus-within:border-ink transition-colors duration-200">
                  <span className="px-3 text-[13px] font-mono text-muted border-e border-rule self-stretch flex items-center">+98</span>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="numeric"
                    placeholder="912 345 6789"
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(normalizePhoneInput(e.target.value))}
                    className="flex-1 px-3 py-2.5 font-body text-[14px] text-ink bg-transparent outline-none placeholder:text-muted"
                    aria-label="شماره موبایل"
                    aria-invalid={!!notifyError}
                    maxLength={10}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-[18px] py-2.5 text-xs font-medium tracking-[0.01em] border border-ink bg-ink text-bg rounded-full transition-all duration-200 hover:bg-plum hover:border-plum"
                  disabled={notifySubmitting}
                >
                  {notifySubmitting ? '...' : 'ثبت'}
                </button>
              </div>
              {notifyError && <p className="text-[12px] text-sale m-0">{notifyError}</p>}
              <button
                type="button"
                className="text-[12px] text-muted self-start hover:text-ink transition-colors duration-200"
                onClick={() => { setNotifyOpen(false); setNotifyError('') }}
              >
                × انصراف
              </button>
            </form>
          ) : (
            <button
              className="w-full flex items-center justify-center gap-2 border border-rule rounded-[10px] py-3.5 text-[14px] font-body text-muted cursor-pointer transition-all duration-200 hover:border-plum hover:text-plum"
              onClick={openNotify}
            >
              <Icon name="bag" size={16} />
              اطلاع‌رسانی وقتی موجود شد
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-2.5 mt-[22px] items-stretch">
          {/* Qty stepper */}
          <div className="inline-flex items-center bg-surface border border-rule rounded-full p-1">
            <button
              className="w-9 h-9 rounded-full grid place-items-center text-ink transition-colors duration-200 hover:bg-bg-2"
              onClick={() => setQty(Math.max(1, qty - 1))}
              aria-label="کم"
            >
              <Icon name="minus" size={14} />
            </button>
            <span className="min-w-8 text-center font-body font-medium text-[14px]">{toFa(qty)}</span>
            <button
              className="w-9 h-9 rounded-full grid place-items-center text-ink transition-colors duration-200 hover:bg-bg-2"
              onClick={() => setQty(qty + 1)}
              aria-label="زیاد"
            >
              <Icon name="plus" size={14} />
            </button>
          </div>
          {/* Add button */}
          <button
            className="flex-1 bg-plum text-bg px-[26px] flex items-center justify-between rounded-full transition-colors duration-200 hover:bg-plum-2 min-h-[52px]"
            onClick={handleAdd}
          >
            <span className="font-medium text-[14px] inline-flex items-center gap-2.5">
              <Icon name="bag" size={16} />
              افزودن به سبد
            </span>
            <span className="font-body text-[13px] opacity-70">{formatNumber(p.price * qty)} ت</span>
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

      {/* Share row */}
      <div className="mt-[22px] flex items-center gap-2.5 pt-[18px] border-t border-rule">
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted me-auto">اشتراک‌گذاری</span>
        {typeof navigator !== 'undefined' && !!navigator.share && (
          <button className={SHARE_BTN} onClick={handleNativeShare} aria-label="اشتراک‌گذاری">
            <Icon name="share" size={13} />
          </button>
        )}
        <button className={SHARE_BTN} onClick={handleTelegram} aria-label="تلگرام">
          <IconTelegram size={13} />
        </button>
        <button className={SHARE_BTN} onClick={handleWhatsApp} aria-label="واتساپ">
          <IconWhatsApp size={13} />
        </button>
        <button className={SHARE_BTN} onClick={handleCopyLink} aria-label="کپی لینک">
          <Icon name="globe" size={13} />
        </button>
      </div>

      {/* Perks */}
      <div className="mt-[22px] flex flex-col gap-3">
        {PERKS.map(({ icon, heading, body }) => (
          <div key={icon} className="flex items-start gap-3.5 p-3.5 bg-surface rounded-[12px] border border-rule">
            <span className="w-9 h-9 rounded-[8px] bg-bg-2 grid place-items-center text-copper flex-shrink-0">
              <Icon name={icon} size={17} />
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-heading text-[13px] font-semibold leading-[1.3] text-ink">{heading}</span>
              <span className="text-[11px] text-muted leading-[1.5]">{body}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Share toast */}
      {toastVisible && (
        <div
          className="fixed bottom-7 left-1/2 -translate-x-1/2 bg-ink text-bg font-body text-[13px] px-[22px] py-2.5 z-[300] pointer-events-none animate-[luxera-rise_220ms_cubic-bezier(.2,.7,.2,1)_both] rounded-[4px]"
          role="status"
          aria-live="polite"
        >
          ✓ لینک کپی شد
        </div>
      )}
    </aside>
  )
}

export default InfoPanel
