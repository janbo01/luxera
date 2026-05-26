/* ============================================================
   Luxera — product + category data
============================================================ */

// Convert ASCII digits to Persian
const FA_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
const toFa = (n) => String(n).replace(/[0-9]/g, d => FA_DIGITS[+d]);
const formatToman = (n) => toFa(n.toLocaleString('en-US')) + ' تومان';

const CATEGORIES = [
  { id: 'necklaces', fa: 'گردنبند', en: 'Necklaces', num: '۰۱', illus: 'NecklaceB' },
  { id: 'bracelets', fa: 'دستبند', en: 'Bracelets', num: '۰۲', illus: 'BraceletA' },
  { id: 'rings',     fa: 'انگشتر', en: 'Rings',     num: '۰۳', illus: 'RingA' },
  { id: 'earrings',  fa: 'گوشواره',en: 'Earrings',  num: '۰۴', illus: 'EarringB' },
  { id: 'sets',      fa: 'ست',     en: 'Sets',      num: '۰۵', illus: 'SetA' },
  { id: 'new',       fa: 'کالکشن جدید', en: 'New', num: '۰۶', illus: 'NecklaceD' },
];

const PRODUCTS = [
  {
    id: 'p1',
    fa: 'گردنبند آوای مهتاب',
    en: 'Mahtab Pendant',
    cat: 'گردنبند',
    price: 4850000,
    oldPrice: null,
    badge: 'تازه',
    badgeKind: 'new',
    illus: 'NecklaceB',
    illusAlt: 'NecklaceC',
    meta: ['طلا ۱۸ عیار', '۴۵ سانت'],
  },
  {
    id: 'p2',
    fa: 'انگشتر ساتن',
    en: 'Satin Solitaire',
    cat: 'انگشتر',
    price: 6920000,
    oldPrice: 7800000,
    badge: '٪۱۲−',
    badgeKind: 'sale',
    illus: 'RingA',
    illusAlt: 'RingD',
    meta: ['برلیان ۰٫۳۰', 'سایز ۵۲'],
  },
  {
    id: 'p3',
    fa: 'دستبند شب پارسی',
    en: 'Parsian Cuff',
    cat: 'دستبند',
    price: 3680000,
    oldPrice: null,
    badge: null,
    illus: 'BraceletB',
    illusAlt: 'BraceletA',
    meta: ['نقره ۹۲۵', 'دور مچ ۱۷'],
  },
  {
    id: 'p4',
    fa: 'گوشواره میناکار',
    en: 'Mina Drop',
    cat: 'گوشواره',
    price: 2950000,
    oldPrice: null,
    badge: 'پرفروش',
    badgeKind: 'new',
    illus: 'EarringB',
    illusAlt: 'EarringC',
    meta: ['طلا و مینا', 'دست‌ساز'],
  },
  {
    id: 'p5',
    fa: 'گردنبند زر و گوهر',
    en: 'Zar Lariat',
    cat: 'گردنبند',
    price: 8420000,
    oldPrice: null,
    badge: null,
    illus: 'NecklaceD',
    illusAlt: 'NecklaceA',
    meta: ['طلا ۱۸ عیار', 'یاقوت کبود'],
  },
  {
    id: 'p6',
    fa: 'انگشتر سه نگین',
    en: 'Trinity Ring',
    cat: 'انگشتر',
    price: 5260000,
    oldPrice: null,
    badge: null,
    illus: 'RingC',
    illusAlt: 'RingB',
    meta: ['طلا سفید', '۳ × زمرد'],
  },
  {
    id: 'p7',
    fa: 'دستبند ریسه آرام',
    en: 'Aram Tennis',
    cat: 'دستبند',
    price: 11400000,
    oldPrice: 12900000,
    badge: '٪۱۰−',
    badgeKind: 'sale',
    illus: 'BraceletC',
    illusAlt: 'BraceletA',
    meta: ['۲۰ × برلیان', 'دور مچ ۱۸'],
  },
  {
    id: 'p8',
    fa: 'ست هدیه شبدر',
    en: 'Shabdar Gift Set',
    cat: 'ست',
    price: 14250000,
    oldPrice: null,
    badge: 'محدود',
    badgeKind: 'new',
    illus: 'SetB',
    illusAlt: 'SetA',
    meta: ['۳ قطعه', 'جعبه چوب گردو'],
  },
];

Object.assign(window, { CATEGORIES, PRODUCTS, toFa, formatToman, FA_DIGITS });
