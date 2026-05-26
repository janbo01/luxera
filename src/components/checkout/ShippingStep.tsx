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
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date(isoDate + 'T00:00:00'))
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
  <section className="co-pane active">
    <div className="co-pane-head">
      <h2>
        <span className="co-pane-head__ic"><Icon name="truck" size={18} strokeWidth={1.8} /></span>
        روشِ ارسال
      </h2>
      <span className="co-pane-head__hint">تحویل تا ۱۸ اردیبهشت برای سفارشِ امروز</span>
    </div>

    <div className="co-ship-list">
      {availableShipping.map((opt) => (
        <div key={opt.id} className={`co-ship${shipping === opt.id ? ' on' : ''}`}>
          <div className="co-ship-head" onClick={() => onSelectShipping(opt.id)}>
            <span className="co-ship-radio" />
            <span className="co-ship-info">
              <span className="co-ship-name">
                {opt.name}
                <span className="en">{opt.nameEn}</span>
                {opt.id === 'snapp_box' && <span className="pop">پرطرفدار</span>}
              </span>
              <span className="co-ship-desc">
                {opt.desc}
                <span className="tag">
                  {opt.id === 'snapp_box'
                    ? <Icon name="clock" size={12} strokeWidth={1.8} />
                    : <Calendar size={12} strokeWidth={1.8} />
                  }
                  {opt.etaLabel}
                </span>
              </span>
            </span>
            <span className={`co-ship-logo ${opt.id === 'snapp_box' ? 'snap' : opt.id}`}>
              {opt.id === 'snapp_box' ? 'S' : opt.id === 'tipax' ? 'T' : 'P'}
            </span>
            <span className="co-ship-price">
              <span className="n">
                {opt.price === 0
                  ? <span style={{ color: 'var(--ok)' }}>رایگان</span>
                  : formatToman(opt.price).replace(' تومان', '')
                }
                {opt.price > 0 && <small>تومان</small>}
              </span>
              {opt.id === 'snapp_box' && <span className="crossed">۳۲۰٬۰۰۰</span>}
            </span>
          </div>

          {/* Snapp scheduler */}
          {opt.id === 'snapp_box' && (
            <div className="co-sched">
              <div className="co-sched-row">
                <div className="co-sched-row__lbl">
                  <span>تاریخِ تحویل</span>
                  <span className="hint">{formatPersianDate(deliveryOptions[snappDayIdx]?.date ?? '')}</span>
                </div>
                <div className="co-day-tabs">
                  {deliveryOptions.map((d, i) => (
                    <button
                      key={d.date}
                      className={`co-day-tab${snappDayIdx === i ? ' on' : ''}`}
                      onClick={() => onSnappDayChange(i)}
                    >
                      <span className="when">{DAY_LABELS[i]}</span>
                      <span className="date">{formatPersianDate(d.date)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="co-sched-row">
                <div className="co-sched-row__lbl">
                  <span>بازه‌ی زمانی</span>
                  <span className="hint">پیک ۱۵ دقیقه قبل تماس می‌گیرد</span>
                </div>
                <div className="co-time-tabs">
                  {(deliveryOptions[snappDayIdx]?.slots ?? []).map((t, i) => (
                    <button
                      key={t.label}
                      className={`co-time-tab${snappTimeIdx === i ? ' on' : ''}`}
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
      ))}
    </div>

    {/* Gift wrap */}
    <div className={`co-gift-row${giftWrap ? ' on' : ''}`} onClick={onGiftWrapToggle}>
      <span className="co-gift-row__ic"><Icon name="gift" size={18} strokeWidth={1.8} /></span>
      <span className="co-gift-row__body">
        <h4>بسته‌بندیِ هدیه <span className="en">Gift Wrapping</span></h4>
        <p>کارتِ دست‌نویس + جعبه‌ی مخمل — مناسب برای هدیه</p>
      </span>
      <span className="co-gift-row__price">{toFa(GIFT_WRAP_PRICE / 1000)}٬۰۰۰<small>تومان</small></span>
      <span className="co-gift-row__check">
        <Icon name="check" size={16} strokeWidth={2.5} />
      </span>
    </div>

    <div className="co-pane-actions">
      <button className="co-btn co-btn--mute" onClick={onBack}>
        <Icon name="arrow-right" size={16} strokeWidth={1.8} />
        ویرایش آدرس
      </button>
      <button className="co-btn co-btn--primary" disabled={!shippingValid} onClick={onNext}>
        ادامه — پرداخت
        <Icon name="arrow" size={16} strokeWidth={1.8} />
      </button>
    </div>
  </section>
)

export default ShippingStep
