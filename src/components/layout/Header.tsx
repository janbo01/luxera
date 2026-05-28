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

function NavLinkItem({ to, label, accent, onClick, mobile }: NavLink & { onClick?: () => void; mobile?: boolean }) {
  const cls = mobile
    ? accent
      ? 'flex items-center px-6 h-14 text-[15px] text-copper-dark font-medium border-b border-rule'
      : 'flex items-center px-6 h-14 text-[15px] text-ink border-b border-rule transition-colors duration-150 active:bg-bg-2'
    : accent
      ? 'text-copper-dark font-medium relative after:absolute after:content-[""] after:-end-3.5 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-1 after:rounded-full after:bg-copper'
      : 'relative py-1.5 text-ink transition-colors duration-200 hover:text-copper'
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

  const iconBtn = 'w-10 h-10 rounded-full grid place-items-center text-ink transition-colors duration-200 hover:bg-bg-2 relative border-none bg-transparent cursor-pointer [&>svg]:w-[18px] [&>svg]:h-[18px]'

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-plum-2 text-[#E6CFCB] text-xs tracking-[0.02em] max-[720px]:hidden">
        <div className="flex justify-between items-center gap-6 py-2.5 px-[var(--pad)] max-w-[1480px] mx-auto">
          <div className="opacity-70 text-[11px]">تماس: ۰۹۱۲-۸۴۹۴۳۰۸</div>
          <div className="flex items-center gap-[18px] flex-wrap">
            <span className="inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="13" height="13"><path d="M3 7h13l5 5-5 5H3z" strokeWidth="1.6"/></svg>
              ارسال رایگان سفارش‌های بالای ۲ میلیون تومان
            </span>
            <i className="block w-[3px] h-[3px] rounded-full bg-copper" />
            <span>۱۴ روز ضمانت بازگشت</span>
            <i className="block w-[3px] h-[3px] rounded-full bg-copper" />
            <span>گارانتی کیفیت محصول</span>
          </div>
          <div className="opacity-70 text-[11px]">فارسی · تومان</div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[rgba(245,237,224,0.86)] backdrop-saturate-[160%] backdrop-blur-[14px] border-b border-rule">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-[var(--pad)] h-[78px] gap-6">

          {/* Mobile hamburger (visible on mobile via responsive) */}
          <button
            className="hidden max-[1100px]:flex items-center justify-center w-10 h-10 text-ink"
            onClick={() => setMenuOpen(true)}
            aria-label="منو"
          >
            <Icon name="menu" size={20} />
          </button>

          {/* Desktop nav */}
          <nav className="flex max-[1100px]:hidden gap-[26px] items-center text-sm font-normal">
            {navLinks.map((link) => <NavLinkItem key={link.to} {...link} />)}
          </nav>

          {/* Logo */}
          <Link to="/" className="flex flex-col items-center gap-0.5 text-center" onClick={closeMenu}>
            <span className="font-display italic font-medium text-[32px] tracking-[0.02em] leading-none text-ink">Luxera</span>
            <span className="font-mono text-[9px] tracking-[0.32em] text-muted uppercase">Fine Jewelry</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1 justify-end">
            <button
              className="flex items-center gap-2 py-2 ps-3.5 pe-2 bg-bg-2 rounded-full cursor-pointer text-sm text-muted min-w-[190px] border-none font-[inherit] transition-colors duration-200 hover:bg-plate max-[720px]:hidden [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:shrink-0"
              onClick={openSearch}
              aria-label="جستجو"
            >
              <Icon name="search" size={16} strokeWidth={1.6} />
              <span>جستجو در فروشگاه…</span>
              <kbd className="ms-auto font-mono text-[10px] bg-bg px-1.5 py-0.5 rounded border border-rule text-ink-2">⌘K</kbd>
            </button>

            <button className={`${iconBtn} hidden max-[720px]:grid`} onClick={openSearch} aria-label="جستجو">
              <Icon name="search" size={18} strokeWidth={1.6} />
            </button>

            <button className={iconBtn} onClick={handleAccountClick} aria-label={isLoggedIn ? 'حساب من' : 'ورود'}>
              <Icon name="user" size={18} strokeWidth={1.6} />
            </button>

            <Link to="/wishlist" className={iconBtn} aria-label="علاقه‌مندی‌ها">
              <Icon name="heart" size={18} strokeWidth={1.6} />
              {wishCount > 0 && (
                <span className="absolute top-1.5 end-1.5 min-w-4 h-4 px-1 bg-copper text-white rounded-full text-[10px] font-semibold grid place-items-center font-mono">{toFa(wishCount)}</span>
              )}
            </Link>

            <button className={iconBtn} onClick={openCart} aria-label="سبد خرید">
              <Icon name="bag" size={18} strokeWidth={1.6} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 end-1.5 min-w-4 h-4 px-1 bg-copper text-white rounded-full text-[10px] font-semibold grid place-items-center font-mono">{toFa(cartCount)}</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile overlay */}
        <div
          className={`fixed inset-0 bg-[rgba(30,20,12,0.45)] z-[200] transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'}`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Mobile drawer */}
        <div
          className={`fixed top-0 start-0 w-[min(320px,88vw)] h-dvh bg-bg z-[201] flex flex-col shadow-[-6px_0_32px_rgba(30,20,12,0.12)] transition-transform duration-[350ms] cubic-bezier(0.25,0.7,0.25,1) ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-label="منوی ناوبری"
          aria-hidden={!menuOpen}
          aria-modal={menuOpen || undefined}
        >
          <div className="flex items-center justify-between px-6 pt-[22px] pb-[18px] border-b border-rule">
            <span className="font-display italic text-2xl tracking-[0.16em] text-ink">Luxera</span>
            <button className="flex items-center justify-center w-9 h-9 text-ink-2" onClick={closeMenu} aria-label="بستن منو">
              <Icon name="close" size={18} />
            </button>
          </div>

          <nav className="flex-1 flex flex-col overflow-y-auto">
            {navLinks.map((link) => <NavLinkItem key={link.to} {...link} onClick={closeMenu} mobile />)}
          </nav>

          <div className="flex gap-5 items-center px-6 py-[18px] border-t border-rule text-xs text-ink-2">
            <button className="flex items-center gap-1.5"><Icon name="globe" size={14} /><span>FA</span></button>
            <button><span>پشتیبانی</span></button>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
