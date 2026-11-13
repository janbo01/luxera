import { usePageMeta } from '../hooks/usePageMeta'
import { useState, useEffect, type FC, type ChangeEvent } from 'react'
import { BTN_CLS } from '../components/ui/Button'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { HttpError } from '../api/client'
import { formatToman, toFa, toLatinDigits } from '../utils/format'
import { SHIPPING, shippingPrice, type ShippingId } from '../data/shipping'
import {
  STEP_LABELS,
  DEFAULT_ADDRESS_FORM,
  GIFT_WRAP_PRICE,
  ALL_PAYMENT_OPTS,
  type PaymentOption,
} from '../data/checkout'
import {
  getDeliverySlots,
  getCoupon,
  checkout,
  type ApiDeliverySlot,
  type ApiCoupon,
} from '../api/order'
import { initiatePayment, getPaymentProviders } from '../api/payment'
import { createAddress, getLoyaltyBalance } from '../api/user'
import { getStoreSettings } from '../api/store'
import type { Address, CheckoutStep, CouponState, PaymentGateway, AddressForm } from '../types'
import Icon from '../components/icons/Icon'
import OrderSummary from '../components/checkout/OrderSummary'
import AddressStep from '../components/checkout/AddressStep'
import ShippingStep from '../components/checkout/ShippingStep'
import PaymentStep from '../components/checkout/PaymentStep'

const DAY_LABELS = ['امروز', 'فردا', 'پس‌فردا']

const CheckoutPage: FC = () => {
  usePageMeta({ title: 'پرداخت و تکمیل سفارش' })
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const addresses = useAuthStore((s) => s.addresses)
  const fetchAddresses = useAuthStore((s) => s.fetchAddresses)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const profile = useAuthStore((s) => s.profile)
  const openLogin = useUIStore((s) => s.openLogin)

  const [step, setStep] = useState<CheckoutStep>(0)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  const [selectedAdr, setSelectedAdr] = useState<string | null>(null)
  const [addr, setAddr] = useState<AddressForm>(DEFAULT_ADDRESS_FORM)
  const [orderNotes, setOrderNotes] = useState('')

  const [deliveryOptions, setDeliveryOptions] = useState<ApiDeliverySlot[]>([])
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([])

  const [loyaltyBalance, setLoyaltyBalance] = useState(0)
  const [loyaltyPointValue, setLoyaltyPointValue] = useState(0)
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0)

  useEffect(() => {
    Promise.all([getDeliverySlots(), getPaymentProviders()])
      .then(([slots, providers]) => {
        setDeliveryOptions(slots)
        const ids = new Set(providers.map((p) => p.id))
        setPaymentOptions(ALL_PAYMENT_OPTS.filter((o) => ids.has(o.id)))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isLoggedIn) fetchAddresses().catch(() => {})
  }, [isLoggedIn, fetchAddresses])

  useEffect(() => {
    if (!isLoggedIn) return
    getLoyaltyBalance()
      .then(setLoyaltyBalance)
      .catch(() => {})
    getStoreSettings()
      .then((s) => setLoyaltyPointValue(s.loyalty_point_value ?? 0))
      .catch(() => {})
  }, [isLoggedIn])

  useEffect(() => {
    if (addresses.length === 0 || selectedAdr !== null) return
    const def = addresses.find((a) => a.isDefault) ?? addresses[0]
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedAdr(def.id)
    setAddr({
      label: def.label,
      name: def.fullName,
      phone: def.phone,
      province: def.province,
      city: def.city,
      street: def.street,
      postal: def.postalCode,
    })
  }, [addresses, selectedAdr])

  // A new customer has no saved address: start the form from the sign-in profile.
  useEffect(() => {
    if (!profile || addresses.length > 0) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAddr((a) => ({
      ...a,
      name: a.name || profile.name || '',
      phone: a.phone || profile.phone || '',
    }))
  }, [profile, addresses.length])

  const [shipping, setShipping] = useState<ShippingId | null>('snapp_box')
  const [snappDayIdx, setSnappDayIdx] = useState(0)
  const [snappTimeIdx, setSnappTimeIdx] = useState(0)

  const [gateway, setGateway] = useState<PaymentGateway>('mock')

  const [coupon, setCoupon] = useState('')
  const [couponState, setCouponState] = useState<CouponState>('idle')
  const [couponError, setCouponError] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [appliedCode, setAppliedCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<ApiCoupon | null>(null)
  const [giftWrap, setGiftWrap] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')

  const isTehran = addr.city.trim() === 'تهران' || addr.province === 'تهران'
  const availableShipping = SHIPPING.filter((o) => !o.teheranOnly || isTehran)
  const selectedShipping = SHIPPING.find((o) => o.id === shipping)

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0)
  const shippingCost = shippingPrice(shipping, subtotal)
  const loyaltyDiscount = loyaltyPointsToUse * loyaltyPointValue
  const total =
    subtotal + shippingCost + (giftWrap ? GIFT_WRAP_PRICE : 0) - couponDiscount - loyaltyDiscount

  const addrValid =
    addr.name.trim() !== '' &&
    addr.phone.trim() !== '' &&
    addr.province !== '' &&
    addr.city.trim() !== '' &&
    addr.street.trim() !== '' &&
    /^\d{10}$/.test(toLatinDigits(addr.postal))
  const shippingValid = shipping !== null

  const snappDate = DAY_LABELS[snappDayIdx] ?? ''
  const snappTime = deliveryOptions[snappDayIdx]?.slots[snappTimeIdx]?.label ?? ''

  const goStep = (n: CheckoutStep) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectSavedAddr = (adr: Address) => {
    setSelectedAdr(adr.id)
    setAddr({
      label: adr.label,
      name: adr.fullName,
      phone: adr.phone,
      province: adr.province,
      city: adr.city,
      street: adr.street,
      postal: adr.postalCode,
    })
    if (shipping === 'snapp_box') {
      const nowTehran = adr.city === 'تهران' || adr.province === 'تهران'
      if (!nowTehran) setShipping(null)
    }
  }

  const handleAddrChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name } = e.target
    const value =
      name === 'postal'
        ? toLatinDigits(e.target.value).replace(/\D/g, '').slice(0, 10)
        : e.target.value
    setSelectedAdr(null)
    setAddr((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'province') next.city = ''
      if ((name === 'city' || name === 'province') && shipping === 'snapp_box') {
        const nowTehran = next.city.trim() === 'تهران' || next.province === 'تهران'
        if (!nowTehran) setShipping(null)
      }
      return next
    })
  }

  const handleApplyCoupon = async () => {
    const code = coupon.trim().toUpperCase()
    if (!code) return
    setCouponState('loading')
    setCouponError('')
    try {
      const data = await getCoupon(code)
      const min = Number(data.min_order_amount)
      if (min > 0 && subtotal < min) {
        setCouponError(`حداقل مبلغ سفارش برای این کد ${min.toLocaleString('fa-IR')} تومان است`)
        setCouponState('error')
        return
      }
      const discount =
        data.discount_type === 'percentage'
          ? Math.round((subtotal * Number(data.discount_value)) / 100)
          : Number(data.discount_value)
      setAppliedCoupon(data)
      setCouponDiscount(discount)
      setAppliedCode(code)
      setCouponState('applied')
    } catch {
      setCouponError('این کد معتبر نیست یا منقضی شده')
      setCouponState('error')
    }
  }

  const handleRemoveCoupon = () => {
    setCoupon('')
    setAppliedCode('')
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponError('')
    setCouponState('idle')
  }

  const handleCouponChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCoupon(e.target.value.toUpperCase())
    if (couponState === 'error') setCouponState('idle')
  }

  const handlePay = async () => {
    if (!shipping) return
    setPaying(true)
    setPayError('')
    try {
      let addressId: string
      if (selectedAdr && addresses.some((a) => a.id === selectedAdr)) {
        addressId = selectedAdr
      } else {
        const savedAddr = await createAddress({
          title: addr.label || 'آدرس سفارش',
          full_address: addr.street,
          city: addr.city,
          province: addr.province,
          postal_code: addr.postal,
          is_default: false,
          recipient_name: addr.name,
          recipient_phone: addr.phone,
        })
        addressId = savedAddr.id
      }

      const order = await checkout({
        shipping_address_id: addressId,
        shipping_method: shipping,
        ...(shipping === 'snapp_box' && {
          delivery_date: deliveryOptions[snappDayIdx]?.date ?? '',
          delivery_slot: deliveryOptions[snappDayIdx]?.slots[snappTimeIdx]?.label ?? '',
        }),
        coupon_code: appliedCode || undefined,
        notes: orderNotes || undefined,
        gift_wrap: giftWrap || undefined,
        gift_message: giftWrap && giftMessage.trim() ? giftMessage.trim() : undefined,
        items: items.map((item) => ({ product_id: item.id, quantity: item.qty })),
        loyalty_points_to_use: loyaltyPointsToUse > 0 ? loyaltyPointsToUse : undefined,
      })

      const payment = await initiatePayment({ order_id: order.id, provider: gateway })
      clearCart()
      window.location.href = payment.redirect_url
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        // The session ended while paying: sign in again; the form keeps its values.
        openLogin('برای ثبت سفارش دوباره وارد شوید.')
        setPayError('نشست شما به پایان رسید. پس از ورود، دوباره «پرداخت» را بزنید.')
        return
      }
      setPayError(err instanceof Error ? err.message : 'خطا در پردازش پرداخت')
    } finally {
      setPaying(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3.5 text-center py-24 px-[var(--pad)] text-muted">
        <Icon name="bag" size={40} strokeWidth={1.5} />
        <h1 className="font-heading font-bold text-[24px] text-ink m-0">سبد خرید شما خالی است</h1>
        <p className="text-sm max-w-[30ch] m-0">محصولی به سبد اضافه کنید تا بتوانید سفارش دهید.</p>
        <a href="/" className={BTN_CLS}>
          بازگشت به فروشگاه
        </a>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)]">
        <div className="flex justify-between items-end gap-8 flex-wrap pt-9 pb-2">
          <h1 className="font-heading text-[clamp(26px,3vw,36px)] font-bold m-0 leading-[1.15]">
            تکمیلِ سفارش
          </h1>
          <div className="flex items-center gap-3 text-[13px] text-muted max-[1100px]:hidden [font-variant-numeric:tabular-nums]">
            <span>{toFa(items.reduce((n, it) => n + it.qty, 0))} کالا</span>
            <span className="w-[5px] h-[5px] rounded-full bg-copper inline-block" />
            <span>{formatToman(total)}</span>
          </div>
        </div>

        {/* Phones: the summary sits below the form, so keep the basket one tap away. */}
        <details className="min-[1100px]:hidden mt-4 rounded-[var(--radius)] border border-rule bg-surface">
          <summary className="flex items-center justify-between gap-3 min-h-12 px-4 cursor-pointer list-none text-[14px]">
            <span className="flex items-center gap-2 text-ink">
              <Icon name="bag" size={16} />
              {toFa(items.reduce((n, it) => n + it.qty, 0))} کالا
            </span>
            <span className="flex items-center gap-2 font-medium text-ink [font-variant-numeric:tabular-nums]">
              {formatToman(total)}
              <Icon name="chevron-down" size={14} className="text-muted" />
            </span>
          </summary>
          <ul className="m-0 p-0 list-none border-t border-rule">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13.5px]"
              >
                <span className="text-ink min-w-0 truncate">
                  {it.fa} <span className="text-muted">× {toFa(it.qty)}</span>
                </span>
                <span className="text-ink-2 shrink-0 [font-variant-numeric:tabular-nums]">
                  {formatToman(it.price * it.qty)}
                </span>
              </li>
            ))}
          </ul>
        </details>

        <div className="my-7">
          <div className="grid grid-cols-3 bg-surface rounded-[var(--radius)] border border-rule p-2 max-[640px]:p-1 max-[640px]:gap-1">
            {STEP_LABELS.map(({ name }, i) => {
              const isActive = i === step
              const isDone = i < step
              return (
                <button
                  key={i}
                  aria-current={isActive ? 'step' : undefined}
                  aria-disabled={!isActive && !isDone ? true : undefined}
                  className={`flex items-center gap-3.5 px-[18px] py-3.5 rounded-sm transition-colors relative max-[640px]:flex-col max-[640px]:gap-1.5 max-[640px]:px-1 max-[640px]:py-2.5 max-[640px]:text-center ${
                    isActive ? 'bg-ink text-bg' : isDone ? 'hover:bg-bg-2' : 'hover:bg-bg-2'
                  }`}
                  onClick={() => {
                    if (isDone) goStep(i as CheckoutStep)
                  }}
                  style={{ cursor: isDone ? 'pointer' : isActive ? 'default' : 'not-allowed' }}
                >
                  <span
                    className={`w-9 h-9 max-[640px]:w-8 max-[640px]:h-8 rounded-full border-[1.5px] grid place-items-center text-sm font-semibold shrink-0 transition-all ${
                      isActive
                        ? 'bg-copper text-white border-copper'
                        : isDone
                          ? 'bg-ok text-white border-ok'
                          : 'border-rule bg-bg'
                    }`}
                  >
                    {isDone ? <Icon name="check" size={16} strokeWidth={2.5} /> : toFa(i + 1)}
                  </span>
                  <span className="flex flex-col gap-0.5 min-w-0">
                    <span
                      className={`font-heading text-[15px] max-[640px]:text-[13.5px] font-semibold leading-[1.2] transition-colors ${
                        isActive ? 'text-bg' : 'text-ink'
                      }`}
                    >
                      {name}
                    </span>
                  </span>
                  {isDone && (
                    <span className="mr-auto text-ok opacity-0 group-[.done]:opacity-100 transition-opacity">
                      <Icon name="check" size={14} strokeWidth={2} />
                    </span>
                  )}
                  {isActive && (
                    <span className="mr-auto text-bg opacity-60 transition-opacity max-[640px]:hidden">
                      <Icon name="arrow-right" size={14} strokeWidth={1.8} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_380px] max-[1100px]:grid-cols-1 gap-6 items-start">
          <div className="min-w-0">
            {step === 0 && !isLoggedIn && (
              <section className="bg-surface border border-rule rounded-[var(--radius)] p-6 flex flex-col gap-4 items-start">
                <span className="w-11 h-11 rounded-full bg-bg-2 grid place-items-center text-copper-dark">
                  <Icon name="user" size={20} />
                </span>
                <h2 className="font-heading text-[20px] font-bold m-0">ورود با شماره‌ی موبایل</h2>
                <p className="m-0 text-[14.5px] text-ink-2 leading-[1.9] max-w-[52ch]">
                  برای ثبت سفارش و پیگیری آن، با شماره‌ی موبایل وارد شوید. یک کد تأیید پیامک می‌شود
                  و سبد خرید شما همین‌جا می‌ماند.
                </p>
                <button
                  type="button"
                  className={`${BTN_CLS} max-sm:w-full max-sm:justify-center`}
                  onClick={() => openLogin('برای ادامه‌ی خرید وارد شوید.')}
                >
                  دریافت کد تأیید
                </button>
              </section>
            )}
            {step === 0 && isLoggedIn && (
              <AddressStep
                addr={addr}
                savedAddresses={addresses}
                selectedAdr={selectedAdr}
                orderNotes={orderNotes}
                addrValid={addrValid}
                onSelectSaved={selectSavedAddr}
                onAddNew={() => {
                  setSelectedAdr(null)
                  setAddr(DEFAULT_ADDRESS_FORM)
                }}
                onAddrChange={handleAddrChange}
                onNotesChange={setOrderNotes}
                onNext={() => addrValid && goStep(1)}
              />
            )}
            {step === 1 && (
              <ShippingStep
                availableShipping={availableShipping}
                shipping={shipping}
                snappDayIdx={snappDayIdx}
                snappTimeIdx={snappTimeIdx}
                giftWrap={giftWrap}
                giftMessage={giftMessage}
                subtotal={subtotal}
                deliveryOptions={deliveryOptions}
                onSelectShipping={setShipping}
                onSnappDayChange={setSnappDayIdx}
                onSnappTimeChange={setSnappTimeIdx}
                onGiftWrapToggle={() => setGiftWrap((v) => !v)}
                onGiftMessageChange={setGiftMessage}
                shippingValid={shippingValid}
                onBack={() => goStep(0)}
                onNext={() => shippingValid && goStep(2)}
              />
            )}
            {step === 2 && (
              <PaymentStep
                gateway={gateway}
                availableOptions={paymentOptions}
                total={total}
                paying={paying}
                payError={payError}
                onSelectGateway={setGateway}
                onBack={() => goStep(1)}
                onPay={handlePay}
              />
            )}
          </div>

          <OrderSummary
            items={items}
            step={step}
            subtotal={subtotal}
            selectedShipping={selectedShipping}
            shippingCost={shippingCost}
            snappDate={snappDate}
            snappTime={snappTime}
            giftWrap={giftWrap}
            couponState={couponState}
            couponError={couponError}
            appliedCode={appliedCode}
            appliedCoupon={appliedCoupon}
            couponDiscount={couponDiscount}
            coupon={coupon}
            total={total}
            addrName={addr.name}
            addrCity={addr.city}
            addrProvince={addr.province}
            addrStreet={addr.street}
            loyaltyBalance={loyaltyBalance}
            loyaltyPointValue={loyaltyPointValue}
            loyaltyPointsToUse={loyaltyPointsToUse}
            loyaltyDiscount={loyaltyDiscount}
            onLoyaltyPointsChange={setLoyaltyPointsToUse}
            onCouponChange={handleCouponChange}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onGoStep={goStep}
          />
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
