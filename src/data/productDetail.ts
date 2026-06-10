import type { ProductDetail, GalleryItem, ColorOption, SizeOption, Review, ReviewBreakdown } from '../types'
import { PRODUCTS } from './products'

const base = PRODUCTS[0]!

export const PRODUCT_DETAIL: ProductDetail = {
  ...base,
  rating: 4.8,
  reviewCount: 184,
  stockCount: 3,
  description: `گردنبند آوای مهتاب یک جواهر فانتزی ظریف با طرحی شیک و مدرن است. زنجیر نازک ۴۵ سانتی با رنگ طلایی و پاندانت کریستالی، قطعه‌ای می‌سازد که هم برای استفاده‌ی روزمره مناسب است، هم برای مناسبت‌های خاص.

پایه‌ی فلزی از آلیاژ بدون نیکل ساخته شده و برای پوست‌های حساس ایمن است. رنگ‌دهی با ضخامت مناسب، در برابر عرق و رطوبت روزمره مقاوم است و با مراقبت ساده درخشش خود را حفظ می‌کند.`,
  highlights: [
    'جواهر فانتزی با طرح شیک و پوشیدنی روزانه',
    'پایه‌ی فلزی بدون نیکل — مناسب پوست حساس',
    'پاندانت کریستالی با درخشش بالا',
    'امکان بازگشت کالا تا ۴ روز پس از دریافت',
  ],
  specs: [
    ['جنس',           'آلیاژ بدون نیکل'],
    ['وزن',           '۴٫۵ گرم'],
    ['طول زنجیر',     '۴۵ سانتی‌متر'],
    ['اندازه پاندانت', '۱۲ × ۱۸ میلی‌متر'],
    ['نگین',          'کریستال شفاف'],
    ['نوع جواهر',     'جواهر فانتزی (Fashion Jewelry)'],
    ['ابعاد بسته‌بندی', '۱۱ × ۱۱ × ۴ سانتی‌متر'],
    ['مناسب برای',    'همه سنین — بدون نیکل'],
  ],
}

export const PRODUCT_GALLERY: GalleryItem[] = [
  { tone: 'plum',   illus: 'NecklaceB' },
  { tone: 'sand',   illus: 'NecklaceC' },
  { tone: 'copper', illus: 'NecklaceA' },
]

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'gold',  fa: 'طلایی',    swatch: 'gold' },
  { id: 'rose',  fa: 'رزگلد',    swatch: 'rose' },
  { id: 'white', fa: 'نقره‌ای', swatch: 'white' },
]

export const SIZE_OPTIONS: SizeOption[] = [
  { id: '40', label: '۴۰', disabled: false },
  { id: '42', label: '۴۲', disabled: false },
  { id: '45', label: '۴۵', disabled: false },
  { id: '50', label: '۵۰', disabled: true },
  { id: '55', label: '۵۵', disabled: false },
  { id: '60', label: '۶۰', disabled: false },
]

export const REVIEWS: Review[] = [
  {
    name: 'نگار رضایی',
    date: '۱۴۰۵/۰۲/۲۸',
    avatar: 'plum',
    rating: 5,
    verified: true,
    title: 'هدیه‌ای که اشک به چشم می‌آورد',
    body: 'برای سالگرد ازدواجمان خریدم. لحظه‌ای که جعبه را باز کرد، چشمانش پر از اشک شد. کیفیت ساخت خیلی بهتر از قیمتش بود و بعد از دو ماه استفاده‌ی روزانه هنوز درخشش اولش را دارد. ارسال در ۲۴ ساعت تهران، بسته‌بندی بسیار شیک.',
    attrs: { 'رنگ': 'طلایی', 'طول': '۴۵' },
    helpful: 47,
    replies: 2,
  },
  {
    name: 'آرمان مهرابی',
    date: '۱۴۰۵/۰۲/۱۲',
    avatar: 'sage',
    rating: 5,
    verified: true,
    title: 'برای مادرم، در روز تولدش',
    body: 'قبل از خرید نگران کیفیت روکش بودم، اما پس از سه ماه استفاده هیچ تغییری نکرده. مادرم از صبح تا شب می‌اندازد و می‌گوید سبک‌ترین گردنبندی است که داشته. با پشتیبانی لوکسرا هم در ارتباط بودم — خیلی صبور و راهنما.',
    attrs: { 'رنگ': 'رزگلد', 'طول': '۴۵' },
    helpful: 33,
    replies: 1,
  },
  {
    name: 'سارا باقری',
    date: '۱۴۰۵/۰۱/۳۰',
    avatar: 'saffron',
    rating: 4,
    verified: true,
    title: 'زیباست، اما زنجیر ظریف‌تر از تصورم بود',
    body: 'نگین خیلی درخشنده و پاندانت عالی است. زنجیر برای سلیقه‌ی من کمی نازک بود — اگر گردنبندهای سنگین‌تر دوست دارید این نکته را در نظر بگیرید. در نهایت یک ستاره کم کردم چون قفل اول‌بار سفت بود ولی بعد راحت شد.',
    attrs: { 'رنگ': 'نقره‌ای', 'طول': '۴۲' },
    helpful: 21,
    replies: 0,
  },
  {
    name: 'شیوا کاویانی',
    date: '۱۴۰۵/۰۱/۱۸',
    avatar: 'teal',
    rating: 5,
    verified: true,
    title: 'مدت‌هاست دنبال یک گردنبند فانتزی باکیفیت بودم',
    body: 'بارها جواهرات ارزان خریدم که زود رنگ می‌داد. لوکسرا فرق دارد — بعد از شنا و استخر هم هنوز درخشش دارد! طراحی کریستال پاندانت در نور آفتاب واقعاً چشمگیر است. قطعاً ست گوشواره‌اش را هم خواهم خرید.',
    attrs: { 'رنگ': 'طلایی', 'طول': '۴۵' },
    helpful: 58,
    replies: 3,
  },
]

export const REVIEW_BREAKDOWN: ReviewBreakdown[] = [
  { stars: 5, count: 142, pct: 77 },
  { stars: 4, count: 28,  pct: 15 },
  { stars: 3, count: 9,   pct: 5 },
  { stars: 2, count: 3,   pct: 2 },
  { stars: 1, count: 2,   pct: 1 },
]
