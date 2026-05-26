import type { HeroTone } from '../types'

export interface Collection {
  slug: string
  fa: string
  en: string
  tagline: string
  tone: HeroTone
  productIds: string[]
  badge?: string
}

export const COLLECTIONS: Collection[] = [
  {
    slug: 'summer-edit',
    fa: 'ادیت تابستانه',
    en: 'Summer Edit',
    tagline: 'سبک و روشن برای روزهای گرم',
    tone: 'sand',
    badge: 'کالکشن جدید',
    productIds: ['p1', 'p3', 'p4', 'p5', 'p6'],
  },
  {
    slug: 'gift-under-500k',
    fa: 'هدیه زیر ۵۰۰ هزار',
    en: 'Gift Under 500K',
    tagline: 'بهترین هدیه‌ها در بودجه‌ای معقول',
    tone: 'copper',
    badge: 'هدیه ویژه',
    productIds: ['p4', 'p3', 'p6', 'p14', 'p15'],
  },
  {
    slug: 'bridal-edit',
    fa: 'ادیت عروس',
    en: 'Bridal Edit',
    tagline: 'درخشان‌ترین لحظه‌های زندگی‌ات',
    tone: 'plum',
    badge: 'کالکشن عروس',
    productIds: ['p9', 'p10', 'p11', 'p12'],
  },
  {
    slug: 'new-arrivals',
    fa: 'تازه‌واردها',
    en: 'New Arrivals',
    tagline: 'آخرین محصولاتی که به لوکسرا رسیده‌اند',
    tone: 'plum',
    badge: 'تازه',
    productIds: ['p1', 'p4', 'p8', 'p13', 'p16'],
  },
]
