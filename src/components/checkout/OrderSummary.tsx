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
  loyaltyBalance: number
  loyaltyPointValue: number
  loyaltyPointsToUse: number
  loyaltyDiscount: number
  onLoyaltyPointsChange: (n: number) => void
  onCouponChange: (e: ChangeEvent<HTMLInputElement>) => void
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
  onGoStep: (n: CheckoutStep) => void
}

const inputCls = 'flex-1 bg-bg border border-rule rounded-[10px] px-3.5 py-[11px] text-[13px] text-ink font-body outline-none placeholder:text-muted placeholder:font-light transition-all focus:border-ink focus:bg-white focus:shadow-[0_0_0_4px_rgba(27,15,29,.06)]'

const PERKS = [
  'ارسالِ بیمه‌شده · بیمه‌ی البرز',
  '۱۴ روز بازگشتِ بدونِ پرسش',
  'گواهیِ اصالتِ همراهِ کالا',
]

const OrderSummary: FC<OrderSummaryProps> = ({
  items, step, subtotal, selectedShipping, snappDate, snappTime,
  giftWrap, couponState, couponError, appliedCode, appliedCoupon, couponDiscount, coupon, total,
  addrName, addrCity, addrProvince, addrStreet,
  loyaltyBalance, loyaltyPointValue, loyaltyPointsToUse, loyaltyDiscount,
  onLoyaltyPointsChange, onCouponChange, onApplyCoupon, onRemoveCoupon, onGoStep,
}) => (
  <aside className="sticky top-[98px] self-start flex flex-col gap-3.5 max-[1100px]:static max-[1100px]:top-0">
    <div className="bg-surface rounded-[var(--radius)] border border-rule overflow-hidden">

      {/* Gradient band */}
      <div className="h-[5px] bg-[linear-gradient(90deg,var(--copper)_0%,var(--copper)_40%,var(--gold)_100%)]" />

      <div className="px-6 pt-6 pb-[22px]">

        {/* Header */}
        <div className="flex items-center justify-between gap-2.5 mb-[18px] pb-4 border-b border-rule">
          <h3 className="font-heading text-[16px] font-semibold m-0 flex items-center gap-2.5">
            خلاصه‌ی سفارش
            <span className="font-mono text-[11px] bg-bg-2 text-ink px-[9px] py-1 rounded-full tracking-[.04em]">
              {toFa(items.length)} قلم
            </span>
          </h3>
          <a className="text-[12px] text-copper underline-offset-[3px] hover:underline" href="#">ویرایش سبد</a>
        </div>

        {/* Line items */}
        <div className="flex flex-col gap-3.5">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[50px_1fr_auto] gap-3 items-center">
              <div className="w-[50px] h-[50px] rounded-[8px] bg-bg-2 grid place-items-center text-ink-2 relative shrink-0 [&_svg]:w-[30px] [&_svg]:h-[30px] [&_svg]:stroke-[1]">
                <span className="absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] rounded-[9px] bg-ink text-bg font-mono text-[10px] font-semibold grid place-items-center px-[5px] border-2 border-surface">
                  {toFa(item.qty)}
                </span>
                <Illustration name={item.illus} />
              </div>
              <div>
                <div className="font-heading text-[13px] font-semibold leading-[1.3]">{item.fa}</div>
                <div className="text-[11px] text-muted font-mono tracking-[.04em] mt-0.5 [direction:ltr]">
                  {formatToman(item.price).replace(' تومان', '')} ت
                </div>
              </div>
              <div className="font-heading text-[13px] font-semibold text-left">
                {formatToman(item.price * item.qty).replace(' تومان', '')}
                <small className="text-[10px] font-normal text-muted mr-0.5">ت</small>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-[18px] pt-[18px] border-t border-dashed border-rule flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-[13px] text-ink-2">
            <span>جمعِ محصولات</span>
            <span className="font-body text-ink">{formatToman(subtotal)}</span>
          </div>
          {step >= 1 && (
            <div className="flex justify-between items-center text-[13px] text-ink-2">
              <span>هزینه‌ی ارسال</span>
              <span className="font-body text-ink">
                {selectedShipping
                  ? formatToman(selectedShipping.price)
                  : <span className="italic text-muted">انتخاب نشده</span>
                }
              </span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between items-center text-[13px] text-ink-2">
              <span>تخفیف کد</span>
              <span className="font-body text-ok">−{formatToman(couponDiscount)}</span>
            </div>
          )}
          {loyaltyDiscount > 0 && (
            <div className="flex justify-between items-center text-[13px] text-ink-2">
              <span>تخفیفِ امتیاز</span>
              <span className="font-body text-ok">−{formatToman(loyaltyDiscount)}</span>
            </div>
          )}
          {giftWrap && step >= 1 && (
            <div className="flex justify-between items-center text-[13px] text-ink-2">
              <span>بسته‌بندیِ هدیه</span>
              <span className="font-body text-ink">{formatToman(GIFT_WRAP_PRICE)}</span>
            </div>
          )}
        </div>

        {/* ETA chip */}
        {step >= 1 && selectedShipping && (
          <div className="mt-3 px-3.5 py-3 bg-bg border border-rule rounded-[10px] flex items-center gap-3 text-[12px]">
            <span className="w-8 h-8 rounded-[8px] bg-surface-2 grid place-items-center text-copper shrink-0 [&_svg]:w-[15px] [&_svg]:h-[15px]">
              <Icon name="clock" size={14} strokeWidth={1.7} />
            </span>
            <div className="flex flex-col gap-[1px] flex-1">
              <span className="font-mono text-[9px] tracking-[.14em] uppercase text-muted">تخمینِ تحویل</span>
              <span className="font-heading text-[13px] font-semibold">
                {selectedShipping.id === 'snapp_box'
                  ? `${snappDate} · ${snappTime}`
                  : selectedShipping.etaLabel}
              </span>
            </div>
            <button
              className="text-[11px] text-copper font-body cursor-pointer hover:underline hover:underline-offset-[3px]"
              onClick={() => onGoStep(1)}
            >
              تغییر
            </button>
          </div>
        )}

        {/* Address chip */}
        {step >= 1 && addrCity && (
          <div className="mt-2.5 p-3.5 bg-bg border border-rule rounded-[10px] flex gap-3 items-start text-[12px] text-ink-2 leading-[1.6]">
            <span className="w-[30px] h-[30px] rounded-full bg-surface-2 grid place-items-center text-copper shrink-0 [&_svg]:w-3.5 [&_svg]:h-3.5">
              <Icon name="location" size={14} strokeWidth={1.8} />
            </span>
            <div className="flex-1 flex flex-col gap-[1px]">
              <span className="font-mono text-[9px] tracking-[.14em] text-muted uppercase">آدرسِ تحویل</span>
              {addrName && (
                <span className="text-ink-2">
                  <strong className="font-heading font-semibold text-ink">{addrName}</strong>
                </span>
              )}
              <span className="text-[11px] text-muted">
                {addrProvince}، {addrCity}{addrStreet ? `، ${addrStreet.slice(0, 40)}` : ''}
              </span>
              <button
                className="text-[11px] text-copper self-start mt-0.5 cursor-pointer hover:underline"
                onClick={() => onGoStep(0)}
              >
                ویرایش
              </button>
            </div>
          </div>
        )}

        {/* Grand total */}
        <div className="mt-[18px] pt-[18px] border-t border-ink flex justify-between items-baseline gap-2.5">
          <span className="font-heading text-[15px] font-semibold">قابلِ پرداخت</span>
          <span className="font-heading text-[22px] font-bold text-ink">
            {formatToman(total).replace(' تومان', '')}
            <small className="font-body text-[12px] font-normal text-muted mr-1.5">تومان</small>
          </span>
        </div>

        {/* Loyalty points */}
        {loyaltyBalance > 0 && loyaltyPointValue > 0 && (
          <div className="mt-3.5">
            <div className="px-3.5 py-3 bg-bg border border-rule rounded-[10px]">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="font-heading text-[13px] font-semibold flex items-center gap-1.5">
                  <Icon name="star" size={13} strokeWidth={1.8} />
                  امتیازِ شما
                </span>
                <span className="font-mono text-[11px] text-copper bg-copper/10 px-2 py-[3px] rounded-full">
                  {toFa(loyaltyBalance)} امتیاز موجود
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  className={`${inputCls} text-center`}
                  type="number"
                  min={0}
                  max={loyaltyBalance}
                  value={loyaltyPointsToUse || ''}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(loyaltyBalance, Number(e.target.value) || 0))
                    onLoyaltyPointsChange(v)
                  }}
                  placeholder="تعداد امتیاز"
                  dir="ltr"
                />
                <button
                  type="button"
                  className="shrink-0 px-3.5 py-[11px] bg-bg-2 text-ink-2 text-[12px] rounded-[10px] border border-rule cursor-pointer hover:bg-bg hover:text-ink transition-colors whitespace-nowrap"
                  onClick={() => onLoyaltyPointsChange(loyaltyBalance)}
                >
                  همه
                </button>
              </div>
              {loyaltyPointsToUse > 0 && (
                <p className="text-[11px] text-ok mt-1.5 font-body">
                  معادلِ {formatToman(loyaltyDiscount)} تخفیف
                </p>
              )}
            </div>
          </div>
        )}

        {/* Coupon */}
        <div className="mt-3.5">
          {couponState !== 'applied' ? (
            <div className="flex gap-2">
              <input
                className={`${inputCls}${couponState === 'error' ? ' border-sale focus:border-sale' : ''}`}
                value={coupon}
                onChange={onCouponChange}
                onKeyDown={(e) => { if (e.key === 'Enter') onApplyCoupon() }}
                placeholder="مثلاً LUXERA20"
                maxLength={20}
                disabled={couponState === 'loading'}
                dir="ltr"
              />
              <button
                className="px-5 py-[11px] bg-ink text-bg rounded-[10px] text-[13px] font-medium cursor-pointer hover:bg-plum transition-colors disabled:bg-bg-2 disabled:text-muted disabled:cursor-not-allowed"
                onClick={onApplyCoupon}
                disabled={couponState === 'loading' || !coupon.trim()}
              >
                {couponState === 'loading' ? '...' : 'اعمال'}
              </button>
            </div>
          ) : (
            <div className="mt-2.5 px-3 py-[9px] bg-[rgba(31,138,91,.08)] border border-[rgba(31,138,91,.25)] rounded-[8px] flex items-center gap-2 text-[12px] text-ok">
              <Icon name="check" size={14} strokeWidth={2} />
              کدِ <span className="font-mono font-semibold tracking-[.08em]">{appliedCode}</span> اعمال شد —{' '}
              {appliedCoupon?.discount_type === 'percentage'
                ? `${toFa(appliedCoupon.discount_value)}٪ تخفیف`
                : `${formatToman(Number(appliedCoupon?.discount_value ?? 0))} تخفیف`}
              <button
                className="mr-auto text-muted w-[18px] h-[18px] rounded-full grid place-items-center cursor-pointer hover:bg-bg-2 hover:text-ink [&_svg]:w-2.5 [&_svg]:h-2.5"
                onClick={onRemoveCoupon}
                aria-label="حذف کد"
              >
                <Icon name="x" size={12} strokeWidth={2} />
              </button>
            </div>
          )}
          {couponState === 'error' && (
            <p className="text-[11px] text-sale mt-1 font-mono" role="alert">
              {couponError || 'این کد معتبر نیست یا منقضی شده'}
            </p>
          )}
        </div>

        {/* Perks */}
        <div className="mt-3.5 pt-3.5 border-t border-dashed border-rule flex flex-col gap-2 text-[11px] text-muted">
          {PERKS.map((text) => (
            <span key={text} className="inline-flex items-center gap-2 [&_svg]:w-[13px] [&_svg]:h-[13px] [&_svg]:text-ok [&_svg]:shrink-0">
              <Icon name="check" size={12} strokeWidth={2} />
              {text}
            </span>
          ))}
        </div>

      </div>
    </div>
  </aside>
)

export default OrderSummary
