import type { ShippingMethod } from '../types'
import { FREE_SHIPPING_THRESHOLD } from '../utils/constants'

export { FREE_SHIPPING_THRESHOLD }

export type ShippingId = ShippingMethod

export interface ShippingOption {
  id: ShippingId
  name: string
  nameEn: string
  price: number
  etaLabel: string
  teheranOnly: boolean
  desc: string
}

export const SHIPPING: ShippingOption[] = [
  {
    id: 'snapp_box',
    name: 'اسنپ‌باکس',
    nameEn: 'Snapp Box',
    price: 280_000,
    etaLabel: 'زمان دلخواه شما',
    teheranOnly: true,
    desc: 'تحویل درب منزل در بازه زمانی دلخواه — فقط تهران',
  },
  {
    id: 'tipax',
    name: 'تیپاکس',
    nameEn: 'Tipax',
    price: 180_000,
    etaLabel: '۲ تا ۳ روز کاری',
    teheranOnly: false,
    desc: 'ارسال به سراسر کشور — ۲ تا ۳ روز کاری',
  },
  {
    id: 'post',
    name: 'پست پیشتاز',
    nameEn: 'Express Post',
    price: 120_000,
    etaLabel: '۳ تا ۵ روز کاری',
    teheranOnly: false,
    desc: 'ارسال به سراسر کشور — ۳ تا ۵ روز کاری',
  },
]

/** Cheapest method, for "shipping from …" before a method is chosen. */
export const MIN_SHIPPING_COST = Math.min(...SHIPPING.map((o) => o.price))

/** What a method costs for this item subtotal. Mirrors the order service
 *  (backend/order/internal/service/delivery.go), which charges the same. */
export function shippingPrice(id: ShippingId | null | undefined, subtotal: number): number {
  if (!id || subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  return SHIPPING.find((o) => o.id === id)?.price ?? 0
}

/**
 * The one set of delivery promises every page repeats (product trust row, product
 * Shipping tab, Shipping page, FAQ, home). It describes what checkout sells.
 */
export const DELIVERY_PROMISE = {
  tehran: 'تهران: اسنپ‌باکس، همان روز یا روز بعد در بازه‌ی دلخواه',
  iran: 'سایر شهرها: تیپاکس ۲ تا ۳ روز کاری، پست پیشتاز ۳ تا ۵ روز کاری',
  short: 'تهران: همان روز یا روز بعد · سایر شهرها: ۲ تا ۵ روز کاری',
} as const
