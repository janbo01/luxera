import { type FC } from 'react'

import Icon from '../icons/Icon'
import { BTN_CLS, BTN_GHOST_CLS } from '../ui/Button'
import { Illustration } from '../../illustrations'
import { formatToman, toFa } from '../../utils/format'
import type { CartItem } from '../../types'
import type { ShippingOption } from '../../data/shipping'

interface OrderSuccessProps {
  orderNum: string
  confirmedItems: CartItem[]
  confirmedShipping: ShippingOption | null
  confirmedSnappDate: string
  confirmedSnappTime: string
  giftWrap: boolean
  giftNote: string
  couponDiscount: number
  giftWrapPrice: number
}

const ROW =
  'flex justify-between items-center px-5 py-[13px] border-b border-rule text-[13px] last:border-b-0'
const ROW_LABEL = 'font-mono text-[10px] tracking-[.12em] uppercase text-muted'

const OrderSuccess: FC<OrderSuccessProps> = ({
  orderNum,
  confirmedItems,
  confirmedShipping,
  confirmedSnappDate,
  confirmedSnappTime,
  giftWrap,
  giftNote,
  couponDiscount,
  giftWrapPrice,
}) => {
  const eta =
    confirmedShipping?.id === 'snapp_box'
      ? `${confirmedSnappDate}، ${confirmedSnappTime}`
      : (confirmedShipping?.etaLabel ?? '—')

  const confirmedTotal =
    confirmedItems.reduce((s, it) => s + it.price * it.qty, 0) +
    (confirmedShipping?.price ?? 0) +
    (giftWrap ? giftWrapPrice : 0) -
    couponDiscount

  return (
    <div
      className="flex flex-col items-center text-center py-24 px-[var(--pad)] max-w-[520px] mx-auto"
      role="main"
    >
      <div aria-live="polite" className="sr-only">
        سفارش با شماره {orderNum} ثبت شد
      </div>

      <div className="w-[76px] h-[76px] rounded-full bg-plum flex items-center justify-center text-bg mb-7 animate-rise">
        <Icon name="check" size={28} />
      </div>

      <h2
        className="font-heading font-bold text-[clamp(28px,4vw,40px)] leading-[1.2] m-0 mb-3.5 text-ink animate-rise [animation-delay:80ms]"
        tabIndex={-1}
      >
        سفارش شما ثبت شد
      </h2>
      <p className="text-muted text-sm leading-[1.85] max-w-[38ch] mx-auto mb-7 animate-rise [animation-delay:80ms]">
        <em className="font-heading not-italic text-plum">Thank you</em> — سپاسگزاریم از خرید شما از
        لوکسرا. پس از تأیید پرداخت، جزئیات ارسال از طریق پیامک برایتان ارسال می‌شود.
      </p>

      <div className="w-full border border-rule bg-surface my-7 animate-rise [animation-delay:160ms]">
        <div className={ROW}>
          <span className={ROW_LABEL}>شماره سفارش</span>
          <strong className="font-mono text-[15px] tracking-[.16em] text-plum font-normal">
            {orderNum}
          </strong>
        </div>
        <div className={ROW}>
          <span className={ROW_LABEL}>روش ارسال</span>
          <span>{confirmedShipping?.name ?? '—'}</span>
        </div>
        <div className={ROW}>
          <span className={ROW_LABEL}>تخمین تحویل</span>
          <span className="inline-flex items-center gap-[5px] font-mono text-[11px] tracking-[.08em] text-copper">
            <Icon name={confirmedShipping?.id === 'snapp_box' ? 'clock' : 'truck'} size={11} />
            {eta}
          </span>
        </div>
        <div className={ROW}>
          <span className={ROW_LABEL}>مبلغ پرداختی</span>
          <span className="text-[15px] font-medium text-ink [font-feature-settings:'tnum']">
            {formatToman(confirmedTotal)}
          </span>
        </div>
      </div>

      <div className="w-full border border-rule bg-surface mb-8 text-right animate-rise [animation-delay:260ms]">
        <div className="px-5 py-[10px] font-mono text-[10px] tracking-[.14em] uppercase text-muted border-b border-rule">
          محصولات سفارش
        </div>
        {confirmedItems.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[44px_1fr_auto] items-center gap-3 px-5 py-3 border-b border-rule last:border-b-0"
          >
            <div className="bg-plate aspect-square flex items-center justify-center text-ink">
              <Illustration name={item.illus} />
            </div>
            <div>
              <div className="text-[12px] font-normal text-ink leading-[1.4]">{item.fa}</div>
              <div className="font-mono text-[10px] text-muted mt-[3px]">{toFa(item.qty)} عدد</div>
            </div>
            <div className="text-[11px] text-ink whitespace-nowrap [font-feature-settings:'tnum']">
              {formatToman(item.price * item.qty)}
            </div>
          </div>
        ))}
        {giftWrap && (
          <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3 px-5 py-3">
            <div className="bg-plum/[.08] text-plum aspect-square flex items-center justify-center">
              <Icon name="spark" size={18} />
            </div>
            <div>
              <div className="text-[12px] font-normal text-ink leading-[1.4]">بسته‌بندی هدیه</div>
              {giftNote && (
                <div className="font-mono text-[10px] text-muted mt-[3px] italic text-ink-2">
                  «{giftNote.slice(0, 60)}
                  {giftNote.length > 60 ? '…' : ''}»
                </div>
              )}
            </div>
            <div className="text-[11px] text-ink whitespace-nowrap [font-feature-settings:'tnum']">
              {formatToman(giftWrapPrice)}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col max-[860px]:flex-col sm:flex-row gap-3 w-full justify-center animate-rise [animation-delay:380ms]">
        <a
          href="/account"
          className={`${BTN_GHOST_CLS} max-[860px]:w-full max-[860px]:justify-center`}
        >
          پیگیری سفارش
        </a>
        <a href="/" className={`${BTN_CLS} max-[860px]:w-full max-[860px]:justify-center`}>
          ادامه خرید
          <span className="arr">←</span>
        </a>
      </div>
    </div>
  )
}

export default OrderSuccess
