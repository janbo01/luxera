import { type FC, type ChangeEvent } from 'react'
import { Illustration } from '../../illustrations'
import { formatToman, toFa } from '../../utils/format'
import Icon from '../icons/Icon'
import { GIFT_WRAP_PRICE } from '../../data/checkout'
import type { CartItem, CouponState, CheckoutStep } from '../../types'
import type { ShippingOption } from '../../data/shipping'
import type { ApiCoupon } from '../../api/order'

interface OrderSummaryProps {
  items: CartItem[]
  step: CheckoutStep
  subtotal: number
  selectedShipping: ShippingOption | undefined
  snappDate: string
  snappTime: string
  giftWrap: boolean
  couponState: CouponState
  couponError: string
  appliedCode: string
  appliedCoupon: ApiCoupon | null
  couponDiscount: number
  coupon: string
  total: number
  addrName: string
  addrCity: string
  addrProvince: string
  addrStreet: string
  onCouponChange: (e: ChangeEvent<HTMLInputElement>) => void
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
  onGoStep: (n: CheckoutStep) => void
}

const OrderSummary: FC<OrderSummaryProps> = ({
  items, step, subtotal, selectedShipping, snappDate, snappTime,
  giftWrap, couponState, couponError, appliedCode, appliedCoupon, couponDiscount, coupon, total,
  addrName, addrCity, addrProvince, addrStreet,
  onCouponChange, onApplyCoupon, onRemoveCoupon, onGoStep,
}) => (
  <aside className="co-summary">
    <div className="co-sum-card">
      <div className="co-sum-band" />
      <div className="co-sum-body">

        <div className="co-sum-head">
          <h3>
            خلاصه‌ی سفارش
            <span className="n">{toFa(items.length)} قلم</span>
          </h3>
          <a className="edit" href="#">ویرایش سبد</a>
        </div>

        <div className="co-line-items">
          {items.map((item) => (
            <div key={item.id} className="co-line">
              <div className="co-line__thumb">
                <span className="q">{toFa(item.qty)}</span>
                <Illustration name={item.illus} />
              </div>
              <div>
                <div className="co-line__name">{item.fa}</div>
                <div className="co-line__sub">
                  {formatToman(item.price).replace(' تومان', '')} ت
                </div>
              </div>
              <div className="co-line__price">
                {formatToman(item.price * item.qty).replace(' تومان', '')}
                <small>ت</small>
              </div>
            </div>
          ))}
        </div>

        <div className="co-totals">
          <div className="row">
            <span>جمعِ محصولات</span>
            <span className="v">{formatToman(subtotal)}</span>
          </div>
          {step >= 1 && (
            <div className="row">
              <span>هزینه‌ی ارسال</span>
              <span className="v">
                {selectedShipping
                  ? formatToman(selectedShipping.price)
                  : <span className="co-ship-na">انتخاب نشده</span>
                }
              </span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="row disc">
              <span>تخفیف کد</span>
              <span className="v">−{formatToman(couponDiscount)}</span>
            </div>
          )}
          {giftWrap && step >= 1 && (
            <div className="row">
              <span>بسته‌بندیِ هدیه</span>
              <span className="v">{formatToman(GIFT_WRAP_PRICE)}</span>
            </div>
          )}
        </div>

        {step >= 1 && selectedShipping && (
          <div className="co-eta">
            <span className="ic"><Icon name="clock" size={14} strokeWidth={1.7} /></span>
            <div className="t">
              <span className="l">تخمینِ تحویل</span>
              <span className="v">
                {selectedShipping.id === 'snapp_box'
                  ? `${snappDate} · ${snappTime}`
                  : selectedShipping.etaLabel}
              </span>
            </div>
            <button className="chg" onClick={() => onGoStep(1)}>تغییر</button>
          </div>
        )}

        {step >= 1 && addrCity && (
          <div className="co-adr-chip">
            <span className="ic"><Icon name="location" size={14} strokeWidth={1.8} /></span>
            <div className="t">
              <span className="l">آدرسِ تحویل</span>
              {addrName && <span className="v"><strong>{addrName}</strong></span>}
              <span className="v co-adr-chip__small">
                {addrProvince}، {addrCity}{addrStreet ? `، ${addrStreet.slice(0, 40)}` : ''}
              </span>
              <button className="chg" onClick={() => onGoStep(0)}>ویرایش</button>
            </div>
          </div>
        )}

        <div className="co-grand">
          <span className="l">قابلِ پرداخت</span>
          <span className="v">{formatToman(total).replace(' تومان', '')}<small>تومان</small></span>
        </div>

        <div className="co-coupon">
          {couponState !== 'applied' ? (
            <div className="co-coupon-row">
              <input
                className={`co-input${couponState === 'error' ? ' is-error' : ''}`}
                value={coupon}
                onChange={onCouponChange}
                onKeyDown={(e) => { if (e.key === 'Enter') onApplyCoupon() }}
                placeholder="مثلاً LUXERA20"
                maxLength={20}
                disabled={couponState === 'loading'}
                dir="ltr"
              />
              <button
                className="co-coupon-apply"
                onClick={onApplyCoupon}
                disabled={couponState === 'loading' || !coupon.trim()}
              >
                {couponState === 'loading' ? '...' : 'اعمال'}
              </button>
            </div>
          ) : (
            <div className="co-coupon-applied">
              <Icon name="check" size={14} strokeWidth={2} />
              کدِ <span className="code">{appliedCode}</span> اعمال شد —{' '}
              {appliedCoupon?.discount_type === 'percentage'
                ? `${toFa(appliedCoupon.discount_value)}٪ تخفیف`
                : `${formatToman(Number(appliedCoupon?.discount_value ?? 0))} تخفیف`}
              <button className="x" onClick={onRemoveCoupon} aria-label="حذف کد">
                <Icon name="x" size={12} strokeWidth={2} />
              </button>
            </div>
          )}
          {couponState === 'error' && (
            <p className="co-coupon-error" role="alert">
              {couponError || 'این کد معتبر نیست یا منقضی شده'}
            </p>
          )}
        </div>

        <div className="co-perks">
          <span><Icon name="check" size={12} strokeWidth={2} /> ارسالِ بیمه‌شده · بیمه‌ی البرز</span>
          <span><Icon name="check" size={12} strokeWidth={2} /> ۱۴ روز بازگشتِ بدونِ پرسش</span>
          <span><Icon name="check" size={12} strokeWidth={2} /> گواهیِ اصالتِ همراهِ کالا</span>
        </div>

      </div>
    </div>
  </aside>
)

export default OrderSummary
