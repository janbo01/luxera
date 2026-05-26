import { type FC } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../icons/Icon'
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
  const eta = confirmedShipping?.id === 'snapp_box'
    ? `${confirmedSnappDate}، ${confirmedSnappTime}`
    : confirmedShipping?.etaLabel ?? '—'

  const confirmedTotal =
    confirmedItems.reduce((s, it) => s + it.price * it.qty, 0)
    + (confirmedShipping?.price ?? 0)
    + (giftWrap ? giftWrapPrice : 0)
    - couponDiscount

  return (
    <div className="checkout-success" role="main">
      <div aria-live="polite" className="sr-only">
        سفارش با شماره {orderNum} ثبت شد
      </div>

      <div className="checkout-success__icon anim-in">
        <Icon name="check" size={28} />
      </div>

      <h2 className="anim-in delay-1" tabIndex={-1}>
        سفارش شما ثبت شد
      </h2>
      <p className="anim-in delay-1">
        <em>Thank you</em> — سپاسگزاریم از خرید شما از لوکسرا.
        پس از تأیید پرداخت، جزئیات ارسال از طریق پیامک برایتان ارسال می‌شود.
      </p>

      <div className="checkout-success__details anim-in delay-2">
        <div className="checkout-success__detail-row">
          <span>شماره سفارش</span>
          <strong className="order-num">{orderNum}</strong>
        </div>
        <div className="checkout-success__detail-row">
          <span>روش ارسال</span>
          <span>{confirmedShipping?.name ?? '—'}</span>
        </div>
        <div className="checkout-success__detail-row">
          <span>تخمین تحویل</span>
          <span className="eta-value">
            <Icon name={confirmedShipping?.id === 'snapp_box' ? 'clock' : 'truck'} size={11} />
            {eta}
          </span>
        </div>
        <div className="checkout-success__detail-row">
          <span>مبلغ پرداختی</span>
          <span className="total-value">{formatToman(confirmedTotal)}</span>
        </div>
      </div>

      <div className="checkout-success__items anim-in delay-3">
        <div className="checkout-success__items-head">محصولات سفارش</div>
        {confirmedItems.map((item) => (
          <div key={item.id} className="checkout-success__item">
            <div className="checkout-success__item-media">
              <Illustration name={item.illus} />
            </div>
            <div className="checkout-success__item-info">
              <div className="checkout-success__item-name">{item.fa}</div>
              <div className="checkout-success__item-qty">{toFa(item.qty)} عدد</div>
            </div>
            <div className="checkout-success__item-price">{formatToman(item.price * item.qty)}</div>
          </div>
        ))}
        {giftWrap && (
          <div className="checkout-success__item checkout-success__item--gift">
            <div className="checkout-success__item-media checkout-success__item-media--gift">
              <Icon name="spark" size={18} />
            </div>
            <div className="checkout-success__item-info">
              <div className="checkout-success__item-name">بسته‌بندی هدیه</div>
              {giftNote && (
                <div className="checkout-success__item-qty checkout-success__item-note">
                  «{giftNote.slice(0, 60)}{giftNote.length > 60 ? '…' : ''}»
                </div>
              )}
            </div>
            <div className="checkout-success__item-price">{formatToman(giftWrapPrice)}</div>
          </div>
        )}
      </div>

      <div className="checkout-success__actions anim-in delay-4">
        <Link to="/account" className="btn btn--ghost">
          پیگیری سفارش
        </Link>
        <Link to="/" className="btn">
          ادامه خرید
          <span className="arr">←</span>
        </Link>
      </div>
    </div>
  )
}

export default OrderSuccess
