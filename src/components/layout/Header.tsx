import { type FC, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../icons/Icon'
import { toFa } from '../../utils/format'
import { useCartStore, selectTotalQty } from '../../store/cartStore'
import { useWishlistStore, selectWishlistCount } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import { useSearchStore } from '../../store/searchStore'
import { useUIStore } from '../../store/uiStore'
import { useBodyLock } from '../../hooks/useBodyLock'
import { NAV_LINKS, type NavLink } from '../../data/navigation'
import { listCategories } from '../../api/product'
import { CATEGORIES } from '../../data/categories'

const STATIC_START: NavLink[] = [
  { to: '/category/new', label: 'تازه‌ترین‌ها', accent: true },
  { to: '/collections',  label: 'کالکشن‌ها' },
]
const STATIC_END: NavLink[] = [
  { to: '#about', label: 'درباره ما' },
]

function NavLinkItem({ to, label, accent, onClick }: NavLink & { onClick?: () => void }) {
  const cls = accent ? 'is-accent' : undefined
  return to.startsWith('/') ? (
    <Link key={to} to={to} className={cls} onClick={onClick}>{label}</Link>
  ) : (
    <a key={to} href={to} className={cls} onClick={onClick}>{label}</a>
  )
}

const Header: FC = () => {
  const cartCount = useCartStore(selectTotalQty)
  const openCart = useCartStore((s) => s.openCart)
  const wishCount = useWishlistStore(selectWishlistCount)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openSearch = useSearchStore((s) => s.open)
  const openLogin = useUIStore((s) => s.openLogin)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [navLinks, setNavLinks] = useState<NavLink[]>(NAV_LINKS)

  const handleAccountClick = () => {
    if (isLoggedIn) navigate('/account')
    else openLogin()
  }

  useEffect(() => {
    listCategories().then((apiCats) => {
      const dynamic: NavLink[] = CATEGORIES
        .filter((local) => local.id !== 'new')
        .flatMap((local) => {
          const match = apiCats.find((c) => c.name === local.fa)
          if (!match) return []
          return [{ to: `/category/${local.id}`, label: local.fa }]
        })
      setNavLinks([...STATIC_START, ...dynamic, ...STATIC_END])
    }).catch(() => {})
  }, [])

  useBodyLock(menuOpen)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* Announcement bar — scrolls away, not sticky */}
      <div className="announce">
        <div className="announce__wrap">
          <div className="announce__side">تماس: ۰۲۱-۲۲۸۷۶۵۴۳</div>
          <div className="announce__mid">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="13" height="13"><path d="M3 7h13l5 5-5 5H3z" strokeWidth="1.6"/></svg>
              ارسال رایگان سفارش‌های بالای ۲ میلیون تومان
            </span>
            <i className="announce__dot" />
            <span>۱۴ روز ضمانت بازگشت</span>
            <i className="announce__dot" />
            <span>گارانتی اصالت طلا و نقره</span>
          </div>
          <div className="announce__side">فارسی · تومان</div>
        </div>
      </div>

    <header className="header">
      <div className="header__top">
        {/* Mobile hamburger — hidden on desktop, col 1 (right) on mobile */}
        <button className="header__hamburger" onClick={() => setMenuOpen(true)} aria-label="منو">
          <Icon name="menu" size={20} />
        </button>

        {/* Desktop nav — col 1 on desktop, hidden on mobile */}
        <nav className="header__nav">
          {navLinks.map((link) => <NavLinkItem key={link.to} {...link} />)}
        </nav>

        {/* Center: logo only */}
        <Link to="/" className="header__brand" onClick={closeMenu}>
          <span className="header__brand-mark">Luxera</span>
          <span className="header__brand-tag">Fine Jewelry</span>
        </Link>

        {/* Actions: search pill + icon tools */}
        <div className="header__actions">
          <button className="header__search-pill" onClick={openSearch} aria-label="جستجو">
            <Icon name="search" size={16} strokeWidth={1.6} />
            <span>جستجو در فروشگاه…</span>
            <kbd>⌘K</kbd>
          </button>

          <button className="header__icobtn header__account-btn" onClick={handleAccountClick} aria-label={isLoggedIn ? 'حساب من' : 'ورود'}>
            <Icon name="user" size={18} strokeWidth={1.6} />
          </button>

          <Link to="/wishlist" className="header__icobtn header__wish-btn" aria-label="علاقه‌مندی‌ها">
            <Icon name="heart" size={18} strokeWidth={1.6} />
            {wishCount > 0 && (
              <span className="header__cart-count">{toFa(wishCount)}</span>
            )}
          </Link>

          <button className="header__icobtn" onClick={openCart} aria-label="سبد خرید">
            <Icon name="bag" size={18} strokeWidth={1.6} />
            {cartCount > 0 && (
              <span className="header__cart-count">{toFa(cartCount)}</span>
            )}
          </button>
        </div>
      </div>

      <div
        className={`header__overlay${menuOpen ? ' is-open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div
        className={`header__drawer${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-label="منوی ناوبری"
        aria-hidden={!menuOpen}
        aria-modal={menuOpen || undefined}
      >
        <div className="header__drawer-head">
          <span className="header__drawer-brand">Luxera</span>
          <button className="header__drawer-close" onClick={closeMenu} aria-label="بستن منو">
            <Icon name="close" size={18} />
          </button>
        </div>
        <nav className="header__drawer-nav">
          {navLinks.map((link) => <NavLinkItem key={link.to} {...link} onClick={closeMenu} />)}
        </nav>
        <div className="header__drawer-foot">
          <button><Icon name="globe" size={14} /><span>FA</span></button>
          <button><span>پشتیبانی</span></button>
        </div>
      </div>
    </header>
    </>
  )
}

export default Header
