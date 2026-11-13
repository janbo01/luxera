import { type FC } from 'react'
import Icon from '../icons/Icon'
import { Calendar } from 'lucide-react'
import { formatToman, toFa } from '../../utils/format'
import { GIFT_MESSAGE_MAX, GIFT_WRAP_PRICE } from '../../data/checkout'
import { shippingPrice, type ShippingId, type ShippingOption } from '../../data/shipping'
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
  snap: 'bg-copper/15 text-copper',
  tipax: 'bg-[#E0E6FF] text-[#3656C9]',
  post: 'bg-copper/15 text-copper-2',
}

interface ShippingStepProps {
  availableShipping: ShippingOption[]
  shipping: ShippingId | null
  snappDayIdx: number
  snappTimeIdx: number
  giftWrap: boolean
  giftMessage: string
  /** Item subtotal, so prices show as free above the threshold. */
  subtotal: number
  deliveryOptions: ApiDeliverySlot[]
  onSelectShipping: (id: ShippingId) => void
  onSnappDayChange: (i: number) => void
  onSnappTimeChange: (i: number) => void
  onGiftWrapToggle: () => void
  onGiftMessageChange: (text: string) => void
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
  giftMessage,
  subtotal,
  deliveryOptions,
  onSelectShipping,
  onSnappDayChange,
  onSnappTimeChange,
  onGiftWrapToggle,
  onGiftMessageChange,
  shippingValid,
  onBack,
  onNext,
}) => (
  <section className="bg-surface rounded-[var(--radius)] border border-rule px-9 pt-9 pb-8 max-[640px]:px-5 max-[640px]:py-6">
    {/* Pane header */}
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 mb-7 pb-5 border-b border-rule">
      <h2 className="font-heading text-[22px] font-semibold m-0 leading-[1.2] flex items-center gap-3 whitespace-nowrap">
        <span className="w-8 h-8 rounded-full bg-bg-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[18px] [&_svg]:h-[18px]">
          <Icon name="truck" size={18} strokeWidth={1.8} />
        </span>
        روشِ ارسال
      </h2>
      <span className="text-[13px] text-muted">تحویل تا ۱۸ اردیبهشت برای سفارشِ امروز</span>
    </div>

    {/* Shipping options */}
    <div className="flex flex-col gap-3">
      {availableShipping.map((opt) => {
        const isOn = shipping === opt.id
        const logoKey = opt.id === 'snapp_box' ? 'snap' : opt.id
        return (
          <div
            key={opt.id}
            className={`relative border rounded-[var(--radius)] bg-bg overflow-hidden transition-[border-color,box-shadow] hover:border-ink-2 ${
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
                  {opt.id === 'snapp_box' && (
                    <span className="px-2 py-0.5 bg-copper/12 text-copper rounded-xs text-[13px] font-medium ">
                      پرطرفدار
                    </span>
                  )}
                </span>
                <span className="text-[13px] text-muted leading-[1.55] flex items-center gap-2 flex-wrap">
                  {opt.desc}
                  <span className="inline-flex items-center gap-[5px] px-[9px] py-[3px] bg-surface-2 border border-rule rounded-full text-[12px] text-ink-2 [&_svg]:w-[11px] [&_svg]:h-[11px] [&_svg]:text-ink-2">
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
                className={`w-[50px] h-[50px] rounded-sm grid place-items-center text-[20px] shrink-0 font-semibold max-[1100px]:hidden ${LOGO_STYLE[logoKey] ?? 'bg-bg-2 text-ink-2'}`}
              >
                {opt.id === 'snapp_box' ? 'S' : opt.id === 'tipax' ? 'T' : 'P'}
              </span>

              {/* Price */}
              <span className="flex flex-col items-start gap-0.5 text-left">
                <span className="font-heading text-[17px] font-bold leading-none">
                  {shippingPrice(opt.id, subtotal) === 0 ? (
                    <span className="text-ok">رایگان</span>
                  ) : (
                    <>
                      {formatToman(opt.price).replace(' تومان', '')}
                      <small className="text-[13px] font-normal text-muted mr-1">تومان</small>
                    </>
                  )}
                </span>
                {shippingPrice(opt.id, subtotal) === 0 && opt.price > 0 && (
                  <span className="text-[12px] line-through text-muted">
                    {formatToman(opt.price)}
                  </span>
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
                    <span className="text-[12px] text-muted font-mono">
                      {formatPersianDate(deliveryOptions[snappDayIdx]?.date ?? '')}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap max-[640px]:flex-col">
                    {deliveryOptions.map((d, i) => (
                      <button
                        key={d.date}
                        className={`flex-1 min-w-[120px] max-[640px]:min-w-0 px-3.5 py-3 border rounded-sm cursor-pointer transition-all flex flex-col gap-0.5 text-right ${
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
                          className={`font-mono text-[12px] ${snappDayIdx === i ? 'text-bg/70' : 'text-muted'}`}
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
                    <span className="text-[12px] text-muted font-mono">
                      پیک ۱۵ دقیقه قبل تماس می‌گیرد
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap max-[640px]:flex-col">
                    {(deliveryOptions[snappDayIdx]?.slots ?? []).map((t, i) => (
                      <button
                        key={t.label}
                        className={`px-3.5 py-2.5 border rounded-sm text-[13px] font-mono transition-all cursor-pointer ${
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

    {/* Gift wrap: a real checkbox so it works from the keyboard and screen readers. */}
    <div
      className={`mt-[18px] border rounded-sm transition-[border-color,background] ${
        giftWrap
          ? 'border-copper border-solid bg-copper/5'
          : 'border-rule border-dashed bg-bg hover:border-ink-2'
      }`}
    >
      <label className="px-[18px] py-4 flex items-center gap-3.5 cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={giftWrap}
          onChange={onGiftWrapToggle}
        />
        <span
          aria-hidden="true"
          className={`w-[38px] h-[38px] rounded-full grid place-items-center shrink-0 transition-colors ${
            giftWrap ? 'bg-copper text-white' : 'bg-surface-2 text-copper'
          }`}
        >
          <Icon name="gift" size={18} strokeWidth={1.8} />
        </span>
        <span className="flex-1 flex flex-col gap-0.5">
          <span className="font-heading text-[14px] font-semibold">بسته‌بندیِ هدیه</span>
          <span className="text-[13px] text-muted">جعبه‌ی مخمل و کارتِ دست‌نویس با متن شما</span>
        </span>
        <span className="font-heading text-[14px] font-semibold whitespace-nowrap">
          {toFa(GIFT_WRAP_PRICE / 1000)}٬۰۰۰
          <small className="text-[13px] font-normal text-muted mr-[3px]">تومان</small>
        </span>
        <span
          aria-hidden="true"
          className={`w-[22px] h-[22px] rounded-xs border-[1.5px] grid place-items-center transition-all peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-ink ${
            giftWrap
              ? 'bg-copper border-copper text-white'
              : 'bg-surface border-rule text-transparent'
          }`}
        >
          <Icon name="check" size={12} strokeWidth={2.5} />
        </span>
      </label>
      {giftWrap && (
        <div className="px-[18px] pb-4 flex flex-col gap-1.5">
          <label htmlFor="gift-message" className="text-[13px] text-ink-2">
            متن کارت <span className="text-muted">(اختیاری)</span>
          </label>
          <textarea
            id="gift-message"
            rows={3}
            maxLength={GIFT_MESSAGE_MAX}
            value={giftMessage}
            onChange={(e) => onGiftMessageChange(e.target.value)}
            placeholder="مثلاً: تولدت مبارک، با عشق"
            className="w-full resize-none bg-surface border border-rule rounded-sm px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
          />
          <span className="text-[12px] text-muted self-end [font-variant-numeric:tabular-nums]">
            {toFa(giftMessage.length)} / {toFa(GIFT_MESSAGE_MAX)}
          </span>
        </div>
      )}
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
