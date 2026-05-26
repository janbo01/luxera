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

export const FLAT_SHIPPING_COST = 180_000

export function calcSimpleShipping(subtotal: number): number {
  return subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? FLAT_SHIPPING_COST : 0
}
