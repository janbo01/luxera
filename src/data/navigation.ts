export interface NavLink {
  to: string
  label: string
  accent?: boolean
}

export const NAV_LINKS: NavLink[] = [
  { to: '/category/new', label: 'تازه‌ترین‌ها', accent: true },
  { to: '/collections', label: 'کالکشن‌ها' },
  { to: '/category/necklaces', label: 'گردنبند' },
  { to: '/category/bracelets', label: 'دستبند' },
  { to: '/category/rings', label: 'انگشتر' },
  { to: '/category/earrings', label: 'گوشواره' },
  { to: '/category/sets', label: 'ست' },
  { to: '/category/bridal', label: 'عروس' },
  { to: '/category/mens', label: 'مردانه' },
  { to: '/gift', label: 'راهنمای هدیه' },
  { to: '/blog', label: 'مجله' },
]

/** Second group in the mobile menu: help pages that otherwise live only in the footer. */
export const HELP_LINKS: NavLink[] = [
  { to: '/shipping', label: 'ارسال و بازگشت' },
  { to: '/faq', label: 'پرسش‌های متداول' },
  { to: '/about', label: 'درباره‌ی لوکسرا' },
  { to: '/contact', label: 'تماس با ما' },
]

/** Category pages that live inside the mega-menu on desktop (everything but "new"). */
export const isCategoryLink = (l: NavLink): boolean =>
  l.to.startsWith('/category/') && l.to !== '/category/new'
