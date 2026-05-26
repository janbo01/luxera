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

  // When variants are defined, filter available options based on selection
  const colorOptions: ColorOption[] = useMemo(() => {
    if (!hasVariants) return allColorOptions
    // show only colors that have at least one variant with quantity > 0 for the current size (or any size if none selected)
    const activeVariants = apiVariants!.filter((v) => v.quantity > 0)
    const validColorIds = new Set(activeVariants.map((v) => v.color_id).filter(Boolean))
    return allColorOptions.map((c) => ({
      ...c,
      disabled: !validColorIds.has(c.id),
    }))
  }, [hasVariants, apiVariants, allColorOptions])

  const sizeOptions: SizeOption[] = useMemo(() => {
    if (!hasVariants) return allSizeOptions
    // show only sizes that have a variant with the selected color and quantity > 0
    const relevantVariants = apiVariants!.filter(
      (v) => v.quantity > 0 && (v.color_id === color || v.color_id === null),
    )
    const validSizeIds = new Set(relevantVariants.map((v) => v.size_id).filter(Boolean))
    return allSizeOptions.map((s) => ({
      ...s,
      disabled: validSizeIds.size > 0 ? !validSizeIds.has(s.id) : s.disabled,
    }))
  }, [hasVariants, apiVariants, allSizeOptions, color])

  // Auto-select a valid size whenever color changes and current size becomes unavailable
  const selectedSizeAvailable = sizeOptions.find((s) => s.id === size && !s.disabled)
  const effectiveSize = selectedSizeAvailable
    ? size
    : sizeOptions.find((s) => !s.disabled)?.id ?? size

  // Current variant stock
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
    <aside className="pinfo">
      <div className="pinfo__top">
        <span className="pinfo__cat">{p.cat || 'جواهرات'}</span>
        <span className="pinfo__sku">LUX-{p.id.slice(0, 6).toUpperCase()}</span>
      </div>

      <h1 className="pinfo__name">
        {p.fa}
        <span className="pinfo__name-en">{p.en}</span>
      </h1>

      <div className="pinfo__rating">
        <Stars value={p.rating} size={14} />
        <span className="pinfo__rating-score">{toFa(p.rating.toFixed(1))}</span>
        <span className="pinfo__rating-sep" />
        <a href="#reviews" className="pinfo__rating-link">
          <b>{toFa(p.reviewCount)}</b> نظر
        </a>
      </div>

      <div className="price-block">
        {p.oldPrice && (
          <div className="price-block__was-row">
            <span className="price-block__was">{formatToman(p.oldPrice)}</span>
            <span className="price-block__off">{toFa(discountPct)}٪ تخفیف</span>
          </div>
        )}
        <span className="price-block__now">
          {formatNumber(p.price)} <small>تومان</small>
        </span>
        {p.oldPrice && (
          <span className="price-block__save">
            شما {formatToman(p.oldPrice - p.price)} تومان صرفه‌جویی می‌کنید
          </span>
        )}
      </div>

      {colorOptions.length > 0 && (
        <div className="psel">
          <div className="psel__head">
            <span className="psel__label">
              <b>رنگ:</b>
              <span className="val">{selectedColor?.fa}</span>
            </span>
          </div>
          <div className="pcolors">
            {colorOptions.map((c) => (
              <button
                key={c.id}
                className={`pcol ${c.hex ? '' : `pcol--${c.swatch}`} ${c.id === color ? 'is-active' : ''}`}
                style={c.hex ? { '--swatch': hexToSwatch(c.hex) } as React.CSSProperties : undefined}
                onClick={() => setColor(c.id)}
                aria-label={c.fa}
              />
            ))}
          </div>
        </div>
      )}

      <div className="psel">
        <div className="psel__head">
          <span className="psel__label">
            <b>طول زنجیر:</b>
            <span className="val">{selectedSize?.label} سانتی‌متر</span>
          </span>
          <button className="psel__guide" onClick={onSizeGuide}>راهنمای سایز</button>
        </div>
        <div className="psizes">
          {sizeOptions.map((s) => (
            <button
              key={s.id}
              className={`psize ${s.id === effectiveSize ? 'is-active' : ''} ${s.disabled ? 'is-disabled' : ''}`}
              disabled={s.disabled}
              onClick={() => !s.disabled && setSize(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {variantStock > 0 && variantStock <= 5 && !outOfStock && (
        <p className="stock-line" role="status">
          <span className="stock-pulse" aria-hidden="true" />
          تنها <b>{toFa(variantStock)} عدد</b> در انبار باقی مانده — احتمال اتمام به‌زودی
        </p>
      )}

      {outOfStock ? (
        <div className="notify-wrap">
          {notifyDone ? (
            <p className="notify-success" role="status">✓ اطلاع خواهیم داد!</p>
          ) : notifyOpen ? (
            <form className="notify-form" id="notify-form" onSubmit={handleNotifySubmit} noValidate>
              <p className="notify-form__label">شماره موبایل را وارد کنید تا اطلاع دهیم</p>
              <div className="notify-form__row">
                <div className="phone-field phone-field--surface notify-form__phone-field">
                  <span className="phone-field__prefix">+98</span>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="numeric"
                    placeholder="912 345 6789"
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(normalizePhoneInput(e.target.value))}
                    className="phone-field__input"
                    aria-label="شماره موبایل"
                    aria-invalid={!!notifyError}
                    maxLength={10}
                  />
                </div>
                <button type="submit" className="btn btn--small" disabled={notifySubmitting}>
                  {notifySubmitting ? '...' : 'ثبت'}
                </button>
              </div>
              {notifyError && <p className="notify-form__error">{notifyError}</p>}
              <button type="button" className="notify-form__cancel"
                onClick={() => { setNotifyOpen(false); setNotifyError('') }}>
                × انصراف
              </button>
            </form>
          ) : (
            <button className="notify-btn" onClick={openNotify}>
              <Icon name="bag" size={16} />
              اطلاع‌رسانی وقتی موجود شد
            </button>
          )}
        </div>
      ) : (
        <div className="cart-row">
          <div className="cart-row__qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="کم">
              <Icon name="minus" size={14} />
            </button>
            <span className="v">{toFa(qty)}</span>
            <button onClick={() => setQty(qty + 1)} aria-label="زیاد">
              <Icon name="plus" size={14} />
            </button>
          </div>
          <button className="cart-row__add" onClick={handleAdd}>
            <span className="lbl">
              <Icon name="bag" size={16} />
              افزودن به سبد
            </span>
            <span className="amt">{formatNumber(p.price * qty)} ت</span>
          </button>
        </div>
      )}

      <button className={`wish-row ${wishlisted ? 'is-active' : ''}`} onClick={toggle}>
        <Icon name={wishlisted ? 'heart-filled' : 'heart'} size={15} />
        {wishlisted ? 'در علاقه‌مندی‌ها ذخیره شد' : 'افزودن به علاقه‌مندی‌ها'}
      </button>

      <div className="pinfo__share">
        <span className="l">اشتراک‌گذاری</span>
        {typeof navigator !== 'undefined' && !!navigator.share && (
          <button className="pinfo__share-btn" onClick={handleNativeShare} aria-label="اشتراک‌گذاری">
            <Icon name="share" size={13} />
          </button>
        )}
        <button className="pinfo__share-btn" onClick={handleTelegram} aria-label="تلگرام">
          <IconTelegram size={13} />
        </button>
        <button className="pinfo__share-btn" onClick={handleWhatsApp} aria-label="واتساپ">
          <IconWhatsApp size={13} />
        </button>
        <button className="pinfo__share-btn" onClick={handleCopyLink} aria-label="کپی لینک">
          <Icon name="globe" size={13} />
        </button>
      </div>

      <div className="pinfo__perks">
        {PERKS.map(({ icon, heading, body }) => (
          <div key={icon} className="pinfo__perk">
            <span className="pinfo__perk-ic"><Icon name={icon} size={17} /></span>
            <div className="pinfo__perk-t">
              <span className="pinfo__perk-h">{heading}</span>
              <span className="pinfo__perk-d">{body}</span>
            </div>
          </div>
        ))}
      </div>

      {toastVisible && (
        <div className="share-toast" role="status" aria-live="polite">✓ لینک کپی شد</div>
      )}
    </aside>
  )
}

export default InfoPanel
