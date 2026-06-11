import { type FC } from 'react'
import Icon from '../icons/Icon'
import { Calendar } from 'lucide-react'
import { formatToman, toFa } from '../../utils/format'
import { GIFT_WRAP_PRICE } from '../../data/checkout'
import type { ShippingOption } from '../../data/shipping'
import type { ShippingId } from '../../data/shipping'
import type { ApiDeliverySlot } from '../../api/order'

const DAY_LABELS = ['امروز', 'فردا', 'پس‌فردا']

function formatPersianDate(isoDate: string): string {
  if (!isoDate) return ''
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(isoDate + 'T00:00:00'))
}

const LOGO_STYLE: Record<string, string> = {
  snap: 'bg-[#FFE8D6] text-copper',
  tipax: 'bg-[#E0E6FF] text-[#3656C9]',
  post: 'bg-[#FFE8DD] text-[var(--copper-2)]',
}

interface ShippingStepProps {
  availableShipping: ShippingOption[]
  shipping: ShippingId | null
  snappDayIdx: number
  snappTimeIdx: number
  giftWrap: boolean
  deliveryOptions: ApiDeliverySlot[]
  onSelectShipping: (id: ShippingId) => void
  onSnappDayChange: (i: number) => void
  onSnappTimeChange: (i: number) => void
  onGiftWrapToggle: () => void
  shippingValid: boolean
  onBack: () => void
  onNext: () => void
}

const ShippingStep: FC<ShippingStepProps> = ({
  availableShipping,
  shipping,
  snappDayIdx,
  snappTimeIdx,
  giftWrap,
  deliveryOptions,
  onSelectShipping,
  onSnappDayChange,
  onSnappTimeChange,
  onGiftWrapToggle,
  shippingValid,
  onBack,
  onNext,
}) => (
  <section className="bg-surface rounded-[var(--radius)] border border-rule px-9 pt-9 pb-8 max-[640px]:px-5 max-[640px]:py-6">
    {/* Pane header */}
    <div className="flex items-end justify-between gap-4 mb-7 pb-5 border-b border-rule">
      <h2 className="font-heading text-[22px] font-semibold m-0 leading-[1.2] flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px]">
          <Icon name="truck" size={18} strokeWidth={1.8} />
        </span>
        روشِ ارسال
      </h2>
      <span className="text-[12px] text-muted">تحویل تا ۱۸ اردیبهشت برای سفارشِ امروز</span>
    </div>

    {/* Shipping options */}
    <div className="flex flex-col gap-3">
      {availableShipping.map((opt) => {
        const isOn = shipping === opt.id
        const logoKey = opt.id === 'snapp_box' ? 'snap' : opt.id
        return (
          <div
            key={opt.id}
            className={`relative border rounded-[12px] bg-bg overflow-hidden transition-[border-color,box-shadow] hover:border-ink-2 ${
              isOn ? 'border-ink shadow-[0_0_0_1px_var(--ink)]' : 'border-rule'
            }`}
          >
            {/* Header row */}
            <div
              className="grid grid-cols-[auto_1fr_auto_auto] max-[1100px]:grid-cols-[auto_1fr_auto] gap-[18px] items-center px-[22px] py-5 cursor-pointer"
              onClick={() => onSelectShipping(opt.id)}
            >
              {/* Radio */}
              <span
                className={`w-[22px] h-[22px] rounded-full border-[1.5px] bg-white grid place-items-center shrink-0 transition-colors ${isOn ? 'border-ink' : 'border-rule'}`}
              >
                <span
                  className={`w-[10px] h-[10px] rounded-full bg-ink transition-transform duration-150 ${isOn ? 'scale-100' : 'scale-0'}`}
                />
              </span>

              {/* Info */}
              <span className="flex flex-col gap-1 min-w-0">
                <span className="font-heading text-[16px] font-semibold leading-[1.2] flex items-center gap-2.5 flex-wrap">
                  {opt.name}
                  <span className="font-display italic text-[13px] text-muted font-normal tracking-[.02em]">
                    {opt.nameEn}
                  </span>
                  {opt.id === 'snapp_box' && (
                    <span className="px-2 py-0.5 bg-[rgba(196,135,58,.12)] text-copper rounded-[4px] font-mono text-[9px] tracking-[.14em] font-medium uppercase">
                      پرطرفدار
                    </span>
                  )}
                </span>
                <span className="text-[13px] text-muted leading-[1.55] flex items-center gap-2 flex-wrap">
                  {opt.desc}
                  <span className="inline-flex items-center gap-[5px] px-[9px] py-[3px] bg-surface-2 border border-rule rounded-full text-[11px] text-ink-2 font-mono tracking-[.04em] [&_svg]:w-[11px] [&_svg]:h-[11px] [&_svg]:text-ink-2">
                    {opt.id === 'snapp_box' ? (
                      <Icon name="clock" size={12} strokeWidth={1.8} />
                    ) : (
                      <Calendar size={12} strokeWidth={1.8} />
                    )}
                    {opt.etaLabel}
                  </span>
                </span>
              </span>

              {/* Logo (hidden on ≤1100px) */}
              <span
                className={`w-[50px] h-[50px] rounded-[10px] grid place-items-center font-display italic text-[20px] shrink-0 font-medium max-[1100px]:hidden ${LOGO_STYLE[logoKey] ?? 'bg-bg-2 text-ink-2'}`}
              >
                {opt.id === 'snapp_box' ? 'S' : opt.id === 'tipax' ? 'T' : 'P'}
              </span>

              {/* Price */}
              <span className="flex flex-col items-start gap-0.5 text-left">
                <span className="font-heading text-[17px] font-bold leading-none">
                  {opt.price === 0 ? (
                    <span className="text-ok">رایگان</span>
                  ) : (
                    formatToman(opt.price).replace(' تومان', '')
                  )}
                  {opt.price > 0 && (
                    <small className="text-[11px] font-normal text-muted mr-1">تومان</small>
                  )}
                </span>
                {opt.id === 'snapp_box' && (
                  <span className="text-[11px] line-through text-muted font-mono">۳۲۰٬۰۰۰</span>
                )}
              </span>
            </div>

            {/* Snapp scheduler — shown only when selected */}
            {opt.id === 'snapp_box' && isOn && (
              <div className="bg-surface-2 px-[22px] py-[22px] border-t border-rule flex flex-col gap-[18px]">
                {/* Date row */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-heading text-[13px] font-semibold">تاریخِ تحویل</span>
                    <span className="text-[11px] text-muted font-mono tracking-[.04em]">
                      {formatPersianDate(deliveryOptions[snappDayIdx]?.date ?? '')}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap max-[640px]:flex-col">
                    {deliveryOptions.map((d, i) => (
                      <button
                        key={d.date}
                        className={`flex-1 min-w-[120px] max-[640px]:min-w-0 px-3.5 py-3 border rounded-[10px] cursor-pointer transition-all flex flex-col gap-0.5 text-right ${
                          snappDayIdx === i
                            ? 'bg-ink text-bg border-ink'
                            : 'bg-bg border-rule hover:border-ink-2'
                        }`}
                        onClick={() => onSnappDayChange(i)}
                      >
                        <span className="font-heading text-[14px] font-semibold">
                          {DAY_LABELS[i]}
                        </span>
                        <span
                          className={`font-mono text-[11px] tracking-[.04em] ${snappDayIdx === i ? 'text-[rgba(245,237,224,.6)]' : 'text-muted'}`}
                        >
                          {formatPersianDate(d.date)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time row */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-heading text-[13px] font-semibold">بازه‌ی زمانی</span>
                    <span className="text-[11px] text-muted font-mono tracking-[.04em]">
                      پیک ۱۵ دقیقه قبل تماس می‌گیرد
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap max-[640px]:flex-col">
                    {(deliveryOptions[snappDayIdx]?.slots ?? []).map((t, i) => (
                      <button
                        key={t.label}
                        className={`px-3.5 py-2.5 border rounded-[8px] text-[13px] font-mono transition-all cursor-pointer tracking-[.04em] ${
                          snappTimeIdx === i
                            ? 'bg-ink text-bg border-ink'
                            : 'bg-bg border-rule hover:border-ink-2'
                        }`}
                        onClick={() => onSnappTimeChange(i)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>

    {/* Gift wrap toggle */}
    <div
      className={`mt-[18px] px-[18px] py-4 border rounded-[10px] flex items-center gap-3.5 cursor-pointer transition-[border-color,background] ${
        giftWrap
          ? 'border-copper border-solid bg-[rgba(196,135,58,.04)]'
          : 'border-rule border-dashed bg-bg hover:border-ink-2'
      }`}
      onClick={onGiftWrapToggle}
    >
      <span
        className={`w-[38px] h-[38px] rounded-full grid place-items-center shrink-0 transition-colors [&_svg]:w-[18px] [&_svg]:h-[18px] [&_svg]:stroke-[1.6] ${
          giftWrap ? 'bg-copper text-white' : 'bg-surface-2 text-copper'
        }`}
      >
        <Icon name="gift" size={18} strokeWidth={1.8} />
      </span>
      <span className="flex-1 flex flex-col gap-0.5">
        <h3 className="font-heading text-[14px] font-semibold m-0 flex items-center gap-2">
          بسته‌بندیِ هدیه
          <span className="font-display italic text-[12px] text-muted font-normal">
            Gift Wrapping
          </span>
        </h3>
        <p className="m-0 text-[12px] text-muted">کارتِ دست‌نویس + جعبه‌ی مخمل — مناسب برای هدیه</p>
      </span>
      <span className="font-heading text-[14px] font-semibold">
        {toFa(GIFT_WRAP_PRICE / 1000)}٬۰۰۰
        <small className="text-[11px] font-normal text-muted mr-[3px]">تومان</small>
      </span>
      <span
        className={`w-[22px] h-[22px] rounded-[6px] border-[1.5px] grid place-items-center transition-all [&_svg]:w-3 [&_svg]:h-3 [&_svg]:stroke-[2.5] ${
          giftWrap
            ? 'bg-copper border-copper text-white [&_svg]:opacity-100'
            : 'bg-white border-rule text-white [&_svg]:opacity-0'
        }`}
      >
        <Icon name="check" size={16} strokeWidth={2.5} />
      </span>
    </div>

    {/* Actions */}
    <div className="flex justify-between items-center gap-3.5 mt-7 pt-6 border-t border-rule max-[640px]:flex-col-reverse max-[640px]:items-stretch">
      <button
        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-medium text-sm tracking-[0.01em] bg-bg-2 text-ink-2 border border-rule cursor-pointer transition-[transform,background,color,border-color,opacity] duration-200 hover:enabled:-translate-y-px hover:enabled:bg-bg hover:enabled:text-ink hover:enabled:border-ink disabled:opacity-50 disabled:cursor-not-allowed max-[640px]:justify-center"
        onClick={onBack}
      >
        <Icon name="arrow-right" size={16} strokeWidth={1.8} />
        ویرایش آدرس
      </button>
      <button
        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full font-medium text-sm tracking-[0.01em] bg-ink text-bg border-none cursor-pointer transition-[transform,background,color,border-color,opacity] duration-200 hover:enabled:-translate-y-px hover:enabled:bg-plum disabled:opacity-50 disabled:cursor-not-allowed max-[640px]:justify-center"
        disabled={!shippingValid}
        onClick={onNext}
      >
        ادامه — پرداخت
        <Icon name="arrow" size={16} strokeWidth={1.8} />
      </button>
    </div>
  </section>
)

export default ShippingStep
