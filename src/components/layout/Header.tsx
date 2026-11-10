import { createPortal } from 'react-dom'
import { type FC, Fragment, useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from '../../hooks/useNavigate'
import Icon from '../icons/Icon'
import { toFa } from '../../utils/format'
import { useCartStore, selectTotalQty } from '../../store/cartStore'
import { useWishlistStore, selectWishlistCount } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import { useSearchStore } from '../../store/searchStore'
import { useUIStore } from '../../store/uiStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useBodyLock } from '../../hooks/useBodyLock'
import { useHydrated } from '../../hooks/useHydrated'
import { usePathname } from '../../hooks/usePathname'
import { NAV_LINKS, isCategoryLink, type NavLink } from '../../data/navigation'
import { CATEGORIES } from '../../data/categories'
import { Illustration } from '../../illustrations'

const ANNOUNCEMENTS = [
  'ارسال رایگان سفارش‌های بالای ۲.۵ میلیون تومان',
  '۴ روز ضمانت بازگشت',
  'گارانتی کیفیت محصول',
]

/** One quiet line on every screen size. It rotates the store promises (once each, here only);
 *  the support phone sits at the start edge on wider screens. */
function AnnouncementBar() {
  const supportPhone = useSettingsStore((s) => s.support_phone || s.support_landline)
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setI((n) => (n + 1) % ANNOUNCEMENTS.length), 4000)
    return () => window.clearInterval(t)
  }, [])
  return (
    <div className="bg-plum-2 text-[var(--color-petal)] text-[12px]" role="status" aria-live="off">
      <div className="relative flex items-center justify-center h-8 md:h-9 px-4 max-w-[1480px] mx-auto md:px-[var(--pad)]">
        {supportPhone ? (
          <span className="absolute start-4 md:start-[var(--pad)] max-md:hidden">
            تماس: {supportPhone}
          </span>
        ) : null}
        <span key={i} className="animate-overlay-in">
          {ANNOUNCEMENTS[i]}
        </span>
      </div>
    </div>
  )
}

function NavLinkItem({
  to,
  label,
  accent,
  onClick,
  mobile,
  active,
}: NavLink & { onClick?: () => void; mobile?: boolean; active?: boolean }) {
  const cls = mobile
    ? `flex items-center justify-between gap-3 px-6 h-14 text-[16px] border-b border-rule transition-colors duration-150 hover:bg-bg-2 active:bg-bg-2 ${
        active
          ? 'text-plum font-medium bg-bg-2 shadow-[inset_-3px_0_0_var(--color-plum)]'
          : accent
            ? 'text-copper-dark font-medium'
            : 'text-ink'
      }`
    : // h-11 gives every desktop link a 44px hit area; the underline sits inside it.
      `relative inline-flex items-center h-11 transition-colors duration-200 hover:text-plum after:absolute after:inset-x-0 after:bottom-2 after:h-px after:bg-plum after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 ${
        active
          ? 'text-plum font-medium after:scale-x-100'
          : accent
            ? 'text-copper-dark font-medium after:scale-x-0'
            : 'text-ink after:scale-x-0'
      }`
  return (
    <a
      key={to}
      href={to}
      className={cls}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      {label}
      {mobile && <Icon name="chevron-left" size={16} className="text-muted shrink-0" />}
    </a>
  )
}

/** Category pages share a prefix, so match the section rather than the exact path. */
function isActive(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`)
}

const MEGA_CATS = CATEGORIES.filter((c) => !['new'].includes(c.id))
const DESKTOP_LINKS = NAV_LINKS.filter((l) => !isCategoryLink(l))

/** Desktop "all categories" panel. Opens on click or hover; Escape and outside clicks close it. */
function MegaMenu({
  headerRef,
  active,
}: {
  headerRef: React.RefObject<HTMLElement | null>
  active: boolean
}) {
  const [open, setOpen] = useState(false)
  const [top, setTop] = useState(78)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback(() => {
    window.clearTimeout(timer.current)
    setTop(headerRef.current?.getBoundingClientRect().bottom ?? 78)
    setOpen(true)
  }, [headerRef])
  const hideSoon = useCallback(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(false), 140)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="mega-panel"
        onClick={() => (open ? setOpen(false) : show())}
        onMouseEnter={() => window.matchMedia('(hover:hover)').matches && show()}
        onMouseLeave={hideSoon}
        className={`inline-flex items-center gap-1.5 h-11 cursor-pointer transition-colors duration-200 hover:text-plum ${active || open ? 'text-plum font-medium' : 'text-ink'}`}
      >
        دسته‌بندی‌ها
        <Icon
          name="chevron-down"
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open &&
        createPortal(
          <div
            id="mega-panel"
            ref={panelRef}
            dir="rtl"
            onMouseEnter={show}
            onMouseLeave={hideSoon}
            style={{ top }}
            className="fixed inset-x-0 z-[49] bg-bg border-b border-rule shadow-[0_24px_48px_-24px_color-mix(in_srgb,var(--color-ink)_30%,transparent)] animate-panel-drop"
          >
            <div className="max-w-[1480px] mx-auto px-[var(--pad)] py-6 grid grid-cols-[1fr_240px] gap-10">
              <ul className="m-0 p-0 list-none grid grid-cols-3 gap-x-6 gap-y-1 content-start">
                {MEGA_CATS.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`/category/${c.id}`}
                      className="group flex items-center gap-3.5 rounded-[var(--radius)] p-2 min-h-14 transition-colors duration-150 hover:bg-bg-2"
                    >
                      <span className="w-12 h-12 shrink-0 rounded-full bg-plate grid place-items-center text-ink [&>svg]:w-[58%] [&>svg]:h-auto">
                        <Illustration name={c.illus} />
                      </span>
                      <span className="text-[15px] text-ink transition-colors duration-150 group-hover:text-plum">
                        {c.fa}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="border-s border-rule ps-8 flex flex-col gap-1 text-[14.5px]">
                <span className="label-fa mb-2">میانبرها</span>
                {[
                  ['/category/new', 'تازه‌ترین‌ها'],
                  ['/collections', 'کالکشن‌های ویژه'],
                  ['/gift', 'راهنمای انتخاب هدیه'],
                  ['/wishlist', 'علاقه‌مندی‌های من'],
                ].map(([to, label]) => (
                  <a
                    key={to}
                    href={to}
                    className="min-h-11 inline-flex items-center text-ink-2 hover:text-plum"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

const ICON_BTN =
  'w-[48px] h-[48px] rounded-full grid place-items-center text-ink transition-colors duration-200 hover:bg-bg-2 relative border-none bg-transparent cursor-pointer [&>svg]:w-[18px] [&>svg]:h-[18px]'

const Header: FC = () => {
  const hydrated = useHydrated()
  const cartCount = useCartStore(selectTotalQty)
  const openCart = useCartStore((s) => s.openCart)
  const wishCount = useWishlistStore(selectWishlistCount)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openSearch = useSearchStore((s) => s.open)
  const openLogin = useUIStore((s) => s.openLogin)
  const navigate = useNavigate()
  const pathname = usePathname()
  // The server has no pathname for this persisted island, so active state only
  // appears after hydration — otherwise SSR and the first client render disagree.
  const activePath = hydrated ? pathname : ''
  const [menuOpen, setMenuOpen] = useState(false)
  // Compact header once the visitor scrolls. Two thresholds (hysteresis) stop it flickering
  // between sizes when the scroll position sits right on the boundary.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        setScrolled((was) => (was ? y > 40 : y > 120))
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  const handleAccountClick = useCallback(() => {
    if (isLoggedIn) navigate('/account')
    else openLogin()
  }, [isLoggedIn, navigate, openLogin])

  // Platform is only knowable in the browser; ⌘K is the SSR/first-render default.
  const shortcutHint =
    hydrated && !/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)
      ? 'Ctrl K'
      : '⌘K'

  useBodyLock(menuOpen)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // `inert` makes the closed drawer invisible to keyboard and assistive tech,
  // fixing the aria-hidden + focusable-descendants accessibility violation.
  const drawerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (drawerRef.current) drawerRef.current.inert = !menuOpen
  }, [menuOpen])

  return (
    <>
      <AnnouncementBar />

      <header
        ref={headerRef}
        className="sticky top-0 z-50 bg-bg/86 backdrop-saturate-[160%] backdrop-blur-[14px] border-b border-rule overflow-x-hidden"
      >
        {/* dir="ltr" keeps logo physically left, actions physically right regardless of page RTL */}
        <div
          className={`relative flex items-center justify-between px-[var(--pad)] gap-3 max-w-[1480px] mx-auto transition-[height] duration-300 ease-[var(--ease-lux)] ${scrolled ? 'h-[60px] max-[720px]:h-[56px]' : 'h-[78px] max-[720px]:h-[64px]'}`}
          dir="ltr"
        >
          {/* Logo — left */}
          <a
            href="/"
            className="flex items-center gap-2.5 shrink-0 min-h-[48px]"
            onClick={closeMenu}
            aria-label="Luxera"
          >
            <img
              src="/logo-crystal.svg"
              alt=""
              width={300}
              height={210}
              className={`w-auto transition-[height] duration-300 ease-[var(--ease-lux)] ${scrolled ? 'h-[32px]' : 'h-[38px]'}`}
            />
            <div className="flex flex-col leading-none gap-[3px]">
              <span className="font-display italic font-medium text-[27px] tracking-[0.02em] leading-none text-ink">
                Luxera
              </span>
              <span className="font-mono text-[9px] tracking-[0.3em] text-muted uppercase">
                Fine Jewelry
              </span>
            </div>
          </a>

          {/* Desktop nav — centered, RTL for Persian text */}
          <nav
            className="flex-1 flex justify-center max-[1100px]:hidden gap-[22px] items-center text-[14.5px] font-normal min-w-0"
            dir="rtl"
            aria-label="دسته‌بندی‌ها"
          >
            {DESKTOP_LINKS.map((link) => (
              <Fragment key={link.to}>
                <NavLinkItem {...link} active={isActive(activePath, link.to)} />
                {link.to === '/collections' && (
                  <MegaMenu
                    headerRef={headerRef}
                    active={activePath.startsWith('/category/') && activePath !== '/category/new'}
                  />
                )}
              </Fragment>
            ))}
          </nav>

          {/* Actions — right */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Search bar — desktop */}
            <button
              className="flex items-center gap-2 h-11 ps-4 pe-2.5 me-1 bg-bg-2 rounded-full cursor-pointer text-sm text-ink-2 min-w-[210px] border border-rule font-[inherit] transition-colors duration-200 hover:bg-plate max-[720px]:hidden [&>svg]:w-3.5 [&>svg]:h-3.5 [&>svg]:shrink-0"
              onClick={openSearch}
              aria-label="جستجو"
              dir="rtl"
            >
              <Icon name="search" size={16} strokeWidth={1.6} />
              <span>جستجو در فروشگاه…</span>
              <kbd
                className="ms-auto font-mono text-[12px] bg-bg px-1.5 py-0.5 rounded border border-rule text-ink-2"
                dir="ltr"
              >
                {shortcutHint}
              </kbd>
            </button>

            {/* Account — hidden on mobile (in BottomNav) */}
            <button
              className={`${ICON_BTN} max-[720px]:hidden`}
              onClick={handleAccountClick}
              aria-label={hydrated && isLoggedIn ? 'حساب من' : 'ورود'}
            >
              <Icon name="user" size={18} strokeWidth={1.6} />
            </button>

            {/* Wishlist — hidden on mobile (in BottomNav) */}
            <a
              href="/wishlist"
              className={`${ICON_BTN} max-[720px]:hidden`}
              aria-label="علاقه‌مندی‌ها"
            >
              <Icon name="heart" size={18} strokeWidth={1.6} />
              {hydrated && wishCount > 0 && (
                <span className="absolute top-1.5 end-1.5 min-w-[18px] h-[18px] px-1 bg-copper text-white rounded-full text-[11px] font-semibold grid place-items-center font-mono">
                  {toFa(wishCount)}
                </span>
              )}
            </a>

            <button className={ICON_BTN} onClick={openCart} aria-label="سبد خرید">
              <Icon name="bag" size={18} strokeWidth={1.6} />
              {hydrated && cartCount > 0 && (
                <span className="absolute top-1.5 end-1.5 min-w-[18px] h-[18px] px-1 bg-copper text-white rounded-full text-[11px] font-semibold grid place-items-center font-mono">
                  {toFa(cartCount)}
                </span>
              )}
            </button>

            {/* Hamburger — mobile only, right side */}
            <button
              className="flex min-[1100px]:hidden items-center justify-center w-[48px] h-[48px] text-ink -me-1"
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
        className={`fixed inset-0 bg-ink/45 backdrop-blur-[2px] z-[200] transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile drawer — outside header so it's positioned relative to viewport, not the backdrop-filter header */}
      <div
        ref={drawerRef}
        id="mobile-drawer"
        className={`fixed top-0 start-0 w-[min(320px,88vw)] h-dvh bg-bg z-[201] flex flex-col shadow-[-6px_0_32px_color-mix(in_srgb,var(--color-plum)_12%,transparent)] transition-[transform,visibility] duration-[350ms] ease-[cubic-bezier(0.25,0.7,0.25,1)] ${menuOpen ? 'translate-x-0 visible' : 'translate-x-full invisible [transition-delay:0ms,350ms]'}`}
        role="dialog"
        aria-label="منوی ناوبری"
        aria-modal="true"
      >
        <div
          className="flex items-center justify-between px-6 pt-[22px] pb-[18px] border-b border-rule"
          dir="ltr"
        >
          <a href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <img src="/logo-crystal.svg" alt="" width={300} height={210} className="h-8 w-auto" />
            <span className="font-display italic text-2xl tracking-[0.14em] text-ink">Luxera</span>
          </a>
          <button
            className="flex items-center justify-center w-11 h-11 -me-2 rounded-full text-ink-2 transition-colors duration-200 hover:bg-bg-2 hover:text-ink"
            onClick={closeMenu}
            aria-label="بستن منو"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col overflow-y-auto">
          {NAV_LINKS.map((link, i) => (
            <Fragment key={link.to}>
              {isCategoryLink(link) && !isCategoryLink(NAV_LINKS[i - 1] ?? link) && (
                <span className="label-fa px-6 pt-5 pb-2">دسته‌بندی‌ها</span>
              )}
              <NavLinkItem
                {...link}
                onClick={closeMenu}
                mobile
                active={isActive(activePath, link.to)}
              />
            </Fragment>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-4 px-6 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] border-t border-rule text-[13px] text-ink-2">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 min-h-11 transition-colors duration-200 hover:text-plum"
            onClick={closeMenu}
          >
            <Icon name="phone" size={15} />
            <span>پشتیبانی</span>
          </a>
          <a
            href="/faq"
            className="inline-flex items-center min-h-11 transition-colors duration-200 hover:text-plum"
            onClick={closeMenu}
          >
            پرسش‌های متداول
          </a>
        </div>
      </div>
    </>
  )
}

export default Header
