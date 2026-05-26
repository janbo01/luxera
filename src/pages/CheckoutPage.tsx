import { usePageMeta } from '../hooks/usePageMeta'
import { useState, useEffect, type FC, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { formatToman, toFa } from '../utils/format'
import { SHIPPING, type ShippingId } from '../data/shipping'
import {
  STEP_LABELS,
  DEFAULT_ADDRESS_FORM,
  GIFT_WRAP_PRICE,
  ALL_PAYMENT_OPTS,
  type PaymentOption,
} from '../data/checkout'
import { getDeliverySlots, getCoupon, checkout, type ApiDeliverySlot, type ApiCoupon } from '../api/order'
import { initiatePayment, getPaymentProviders } from '../api/payment'
import { createAddress } from '../api/user'
import type { Address, CheckoutStep, CouponState, PaymentGateway, AddressForm } from '../types'
import Icon from '../components/icons/Icon'
import OrderSummary from '../components/checkout/OrderSummary'
import AddressStep from '../components/checkout/AddressStep'
import ShippingStep from '../components/checkout/ShippingStep'
import PaymentStep from '../components/checkout/PaymentStep'

const DAY_LABELS = ['امروز', 'فردا', 'پس‌فردا']

const CheckoutPage: FC = () => {
  usePageMeta({ title: 'پرداخت و تکمیل سفارش' })
  const items     = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const { addresses, fetchAddresses, isLoggedIn } = useAuthStore()

  const [step, setStep]     = useState<CheckoutStep>(0)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  const [selectedAdr, setSelectedAdr] = useState<string | null>(null)
  const [addr, setAddr]               = useState<AddressForm>(DEFAULT_ADDRESS_FORM)
  const [orderNotes, setOrderNotes]   = useState('')

  const [deliveryOptions, setDeliveryOptions] = useState<ApiDeliverySlot[]>([])
  const [paymentOptions, setPaymentOptions]   = useState<PaymentOption[]>([])

  useEffect(() => {
    getDeliverySlots().then(setDeliveryOptions).catch(() => {})
  }, [])

  useEffect(() => {
    getPaymentProviders().then((providers) => {
      const ids = new Set(providers.map((p) => p.id))
      setPaymentOptions(ALL_PAYMENT_OPTS.filter((o) => ids.has(o.id)))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (isLoggedIn) fetchAddresses().catch(() => {})
  }, [isLoggedIn, fetchAddresses])

  useEffect(() => {
    if (addresses.length === 0 || selectedAdr !== null) return
    const def = addresses.find((a) => a.isDefault) ?? addresses[0]
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedAdr(def.id)
    setAddr({ label: def.label, name: def.fullName, phone: def.phone, province: def.province, city: def.city, street: def.street, postal: def.postalCode })
  }, [addresses, selectedAdr])

  const [shipping, setShipping]         = useState<ShippingId | null>('snapp_box')
  const [snappDayIdx, setSnappDayIdx]   = useState(0)
  const [snappTimeIdx, setSnappTimeIdx] = useState(0)

  const [gateway, setGateway] = useState<PaymentGateway>('mock')

  const [coupon, setCoupon]             = useState('')
  const [couponState, setCouponState]   = useState<CouponState>('idle')
  const [couponError, setCouponError]   = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [appliedCode, setAppliedCode]   = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<ApiCoupon | null>(null)
  const [giftWrap, setGiftWrap] = useState(false)

  const isTehran          = addr.city.trim() === 'تهران' || addr.province === 'تهران'
  const availableShipping = SHIPPING.filter((o) => !o.teheranOnly || isTehran)
  const selectedShipping  = SHIPPING.find((o) => o.id === shipping)

  const subtotal     = items.reduce((s, it) => s + it.price * it.qty, 0)
  const shippingCost = selectedShipping?.price ?? 0
  const total        = subtotal + shippingCost + (giftWrap ? GIFT_WRAP_PRICE : 0) - couponDiscount

  const addrValid = addr.name.trim() !== '' && addr.phone.trim() !== '' &&
                    addr.province !== '' && addr.city.trim() !== '' &&
                    addr.street.trim() !== '' && addr.postal.trim() !== ''
  const shippingValid = shipping !== null

  const snappDate = DAY_LABELS[snappDayIdx] ?? ''
  const snappTime = deliveryOptions[snappDayIdx]?.slots[snappTimeIdx]?.label ?? ''

  const goStep = (n: CheckoutStep) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectSavedAddr = (adr: Address) => {
    setSelectedAdr(adr.id)
    setAddr({ label: adr.label, name: adr.fullName, phone: adr.phone, province: adr.province, city: adr.city, street: adr.street, postal: adr.postalCode })
    if (shipping === 'snapp_box') {
      const nowTehran = adr.city === 'تهران' || adr.province === 'تهران'
      if (!nowTehran) setShipping(null)
    }
  }

  const handleAddrChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
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
      const discount = data.discount_type === 'percentage'
        ? Math.round(subtotal * Number(data.discount_value) / 100)
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
        items: items.map((item) => ({ product_id: item.id, quantity: item.qty })),
      })

      const payment = await initiatePayment({ order_id: order.id, provider: gateway })
      clearCart()
      window.location.href = payment.redirect_url
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'خطا در پردازش پرداخت')
    } finally {
      setPaying(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <Icon name="bag" size={40} strokeWidth={1.5} />
        <h3>سبد خرید شما خالی است</h3>
        <p>محصولی به سبد اضافه کنید تا بتوانید سفارش دهید.</p>
        <Link to="/" className="btn">بازگشت به فروشگاه</Link>
      </div>
    )
  }

  return (
    <div className="co-page">
      <div className="wrap">

        <div className="co-page-head">
          <div>
            <span className="co-page-head__kicker">Checkout</span>
            <h1 className="co-page-head__h1">تکمیلِ <em>سفارش</em></h1>
          </div>
          <div className="co-meta">
            <span>سفارش</span>
            <span className="co-meta__val">#LX-۱۴۰۴</span>
            <span className="co-meta__dot" />
            <span>{toFa(items.length)} کالا</span>
            <span className="co-meta__dot" />
            <span>{formatToman(subtotal)}</span>
          </div>
        </div>

        <div className="co-stepper">
          <div className="co-steps">
            {STEP_LABELS.map(({ lbl, name }, i) => (
              <button
                key={i}
                className={`co-step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
                onClick={() => { if (i < step) goStep(i as CheckoutStep) }}
                style={{ cursor: i < step ? 'pointer' : i === step ? 'default' : 'not-allowed' }}
              >
                <span className="co-step__num">
                  {i < step
                    ? <Icon name="check" size={16} strokeWidth={2.5} />
                    : toFa(i + 1)
                  }
                </span>
                <span className="co-step__text">
                  <span className="co-step__lbl">{lbl}</span>
                  <span className="co-step__name">{name}</span>
                </span>
                {i < step && (
                  <span className="co-step__check">
                    <Icon name="check" size={14} strokeWidth={2} />
                  </span>
                )}
                {i === step && (
                  <span className="co-step__arrow">
                    <Icon name="arrow-right" size={14} strokeWidth={1.8} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="co-layout">
          <div className="co-panes">
            {step === 0 && (
              <AddressStep
                addr={addr}
                savedAddresses={addresses}
                selectedAdr={selectedAdr}
                orderNotes={orderNotes}
                addrValid={addrValid}
                onSelectSaved={selectSavedAddr}
                onAddNew={() => { setSelectedAdr(null); setAddr(DEFAULT_ADDRESS_FORM) }}
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
                deliveryOptions={deliveryOptions}
                onSelectShipping={setShipping}
                onSnappDayChange={setSnappDayIdx}
                onSnappTimeChange={setSnappTimeIdx}
                onGiftWrapToggle={() => setGiftWrap((v) => !v)}
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
