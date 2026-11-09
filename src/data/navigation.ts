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
  { to: '/gift', label: 'راهنمای هدیه' },
  { to: '/about', label: 'درباره ما' },
]

/** Category pages that live inside the mega-menu on desktop (everything but "new"). */
export const isCategoryLink = (l: NavLink): boolean =>
  l.to.startsWith('/category/') && l.to !== '/category/new'
