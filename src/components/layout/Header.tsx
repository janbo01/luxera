import { type FC, useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../icons/Icon'
import { toFa } from '../../utils/format'
import { useCartStore, selectTotalQty } from '../../store/cartStore'
import { useWishlistStore, selectWishlistCount } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import { useSearchStore } from '../../store/searchStore'
import { useUIStore } from '../../store/uiStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useBodyLock } from '../../hooks/useBodyLock'
import { NAV_LINKS, type NavLink } from '../../data/navigation'

function AnnouncementBar() {
  const supportPhone = useSettingsStore((s) => s.support_phone || s.support_landline)
  return (
  <div className="bg-plum-2 text-[var(--color-petal)] text-xs tracking-[0.02em] max-[720px]:hidden">
    <div className="flex justify-between items-center gap-6 py-2.5 px-[var(--pad)] max-w-[1480px] mx-auto">
      <div className="opacity-70 text-[11px]">{supportPhone ? `تماس: ${supportPhone}` : null}</div>
      <div className="flex items-center gap-[18px] flex-wrap">
        <span className="inline-flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="13" height="13"><path d="M3 7h13l5 5-5 5H3z" strokeWidth="1.6"/></svg>
          ارسال رایگان سفارش‌های بالای ۲.۵ میلیون تومان
        </span>
        <i className="block w-[3px] h-[3px] rounded-full bg-copper" />
        <span>۴ روز ضمانت بازگشت</span>
        <i className="block w-[3px] h-[3px] rounded-full bg-copper" />
        <span>گارانتی کیفیت محصول</span>
      </div>
      <div className="opacity-70 text-[11px]">فارسی · تومان</div>
    </div>
  </div>
  )
}

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

const ICON_BTN = 'w-10 h-10 rounded-full grid place-items-center text-ink transition-colors duration-200 hover:bg-bg-2 relative border-none bg-transparent cursor-pointer [&>svg]:w-[18px] [&>svg]:h-[18px]'

const Header: FC = () => {
  const cartCount = useCartStore(selectTotalQty)
  const openCart = useCartStore((s) => s.openCart)
  const wishCount = useWishlistStore(selectWishlistCount)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openSearch = useSearchStore((s) => s.open)
  const openLogin = useUIStore((s) => s.openLogin)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const handleAccountClick = useCallback(() => {
    if (isLoggedIn) navigate('/account')
    else openLogin()
  }, [isLoggedIn, navigate, openLogin])

  useBodyLock(menuOpen)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // `inert` makes the closed drawer invisible to keyboard and assistive tech,
  // fixing the aria-hidden + focusable-descendants accessibility violation.
  const drawerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (drawerRef.current) drawerRef.current.inert = !menuOpen
  }, [menuOpen])

  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-50 bg-bg/86 backdrop-saturate-[160%] backdrop-blur-[14px] border-b border-rule overflow-x-hidden">
        {/* dir="ltr" keeps logo physically left, actions physically right regardless of page RTL */}
        <div className="relative flex items-center justify-between px-[var(--pad)] h-[78px] gap-3" dir="ltr">

          {/* Logo — left */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={closeMenu} aria-label="Luxera">
            <img src="/logo-crystal.svg" alt="Luxera" aria-hidden="true" width={300} height={210} className="h-[38px] w-auto" />
            <div className="flex flex-col leading-none gap-[3px]">
              <span className="font-display italic font-medium text-[27px] tracking-[0.02em] leading-none text-ink">Luxera</span>
              <span className="font-mono text-[7.5px] tracking-[0.3em] text-muted uppercase">Fine Jewelry</span>
            </div>
          </Link>

          {/* Desktop nav — centered, RTL for Persian text */}
          <nav className="flex-1 flex justify-center max-[1100px]:hidden gap-[24px] items-center text-sm font-normal min-w-0" dir="rtl">
            {NAV_LINKS.map((link) => <NavLinkItem key={link.to} {...link} />)}
          </nav>

          {/* Actions — right */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Search bar — desktop */}
            <button
              className="flex items-center gap-2 py-2 ps-3.5 pe-2 bg-bg-2 rounded-full cursor-pointer text-sm text-muted min-w-[190px] border-none font-[inherit] transition-colors duration-200 hover:bg-plate max-[720px]:hidden [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:shrink-0"
              onClick={openSearch}
              aria-label="جستجو"
              dir="rtl"
            >
              <Icon name="search" size={16} strokeWidth={1.6} />
              <span>جستجو در فروشگاه…</span>
              <kbd className="ms-auto font-mono text-[10px] bg-bg px-1.5 py-0.5 rounded border border-rule text-ink-2">⌘K</kbd>
            </button>

            {/* Search icon — mobile */}
            <button className={`${ICON_BTN} hidden max-[720px]:grid`} onClick={openSearch} aria-label="جستجو">
              <Icon name="search" size={18} strokeWidth={1.6} />
            </button>

            {/* Account — hidden on mobile to avoid crowding */}
            <button className={`${ICON_BTN} max-[720px]:hidden`} onClick={handleAccountClick} aria-label={isLoggedIn ? 'حساب من' : 'ورود'}>
              <Icon name="user" size={18} strokeWidth={1.6} />
            </button>

            <Link to="/wishlist" className={ICON_BTN} aria-label="علاقه‌مندی‌ها">
              <Icon name="heart" size={18} strokeWidth={1.6} />
              {wishCount > 0 && (
                <span className="absolute top-1.5 end-1.5 min-w-4 h-4 px-1 bg-copper text-white rounded-full text-[10px] font-semibold grid place-items-center font-mono">{toFa(wishCount)}</span>
              )}
            </Link>

            <button className={ICON_BTN} onClick={openCart} aria-label="سبد خرید">
              <Icon name="bag" size={18} strokeWidth={1.6} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 end-1.5 min-w-4 h-4 px-1 bg-copper text-white rounded-full text-[10px] font-semibold grid place-items-center font-mono">{toFa(cartCount)}</span>
              )}
            </button>

            {/* Hamburger — mobile only, right side */}
            <button
              className="flex min-[1100px]:hidden items-center justify-center w-10 h-10 text-ink -me-1"
              onClick={() => setMenuOpen(true)}
              aria-label="منو"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>

      </header>

      {/* Mobile overlay — outside header so backdrop-filter doesn't create a containing block */}
      <div
        className={`fixed inset-0 bg-plum/45 z-[200] transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile drawer — outside header so it's positioned relative to viewport, not the backdrop-filter header */}
      <div
        ref={drawerRef}
        id="mobile-drawer"
        className={`fixed top-0 start-0 w-[min(320px,88vw)] h-dvh bg-bg z-[201] flex flex-col shadow-[-6px_0_32px_color-mix(in_srgb,var(--color-plum)_12%,transparent)] transition-transform duration-[350ms] cubic-bezier(0.25,0.7,0.25,1) ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="منوی ناوبری"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 pt-[22px] pb-[18px] border-b border-rule" dir="ltr">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <img src="/logo-crystal.svg" alt="Luxera" aria-hidden="true" width={300} height={210} className="h-8 w-auto" />
            <span className="font-display italic text-2xl tracking-[0.14em] text-ink">Luxera</span>
          </Link>
          <button className="flex items-center justify-center w-9 h-9 text-ink-2" onClick={closeMenu} aria-label="بستن منو">
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col overflow-y-auto">
          {NAV_LINKS.map((link) => <NavLinkItem key={link.to} {...link} onClick={closeMenu} mobile />)}
        </nav>

        <div className="flex gap-5 items-center px-6 py-[18px] border-t border-rule text-xs text-ink-2">
          <button className="flex items-center gap-1.5" aria-label="تغییر زبان"><Icon name="globe" size={14} /><span>FA</span></button>
          <button aria-label="پشتیبانی"><span>پشتیبانی</span></button>
        </div>
      </div>
    </>
  )
}

export default Header
