import type { PaymentGateway } from '../types'

/** Same price and limit as the order service (backend/order/internal/service/delivery.go). */
export const GIFT_WRAP_PRICE = 15_000
export const GIFT_MESSAGE_MAX = 200

export const STEP_LABELS = [{ name: 'آدرس تحویل' }, { name: 'روش ارسال' }, { name: 'پرداخت' }]

export interface PaymentOption {
  id: PaymentGateway
  logoClass: string
  logoChar: string
  name: string
  en: string
  sub: string
}

// Full catalogue of known providers. Filtered at runtime against GET /payments/providers.
export const ALL_PAYMENT_OPTS: PaymentOption[] = [
  {
    id: 'mock',
    logoClass: 'mock',
    logoChar: 'M',
    name: 'درگاهِ آزمایشی',
    en: 'Mock Gateway',
    sub: 'فقط برای محیطِ توسعه',
  },
  {
    id: 'zarinpal',
    logoClass: 'zp',
    logoChar: 'Z',
    name: 'زرین‌پال',
    en: 'Zarinpal',
    sub: 'پرداختِ آنی · تمامیِ کارت‌های شتاب',
  },
  {
    id: 'saman',
    logoClass: 'sep',
    logoChar: 'S',
    name: 'بانکِ سامان',
    en: 'Saman — SEP',
    sub: 'درگاهِ مستقیمِ بانک سامان',
  },
]

export const DEFAULT_ADDRESS_FORM = {
  label: '',
  name: '',
  phone: '',
  province: '',
  city: '',
  street: '',
  postal: '',
}
