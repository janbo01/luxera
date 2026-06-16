import { type FC } from 'react'
import { usePathname } from '../../hooks/usePathname'
import { useNavigate } from '../../hooks/useNavigate'
import Icon from '../icons/Icon'
import { toFa } from '../../utils/format'
import { useWishlistStore, selectWishlistCount } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import { useSearchStore } from '../../store/searchStore'
import { useUIStore } from '../../store/uiStore'
import { useCartStore, selectTotalQty } from '../../store/cartStore'

const BottomNav: FC = () => {
  const pathname = usePathname()
  const navigate = useNavigate()
  const wishCount = useWishlistStore(selectWishlistCount)
  const cartCount = useCartStore(selectTotalQty)
  const openCart = useCartStore((s) => s.openCart)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openSearch = useSearchStore((s) => s.open)
  const openLogin = useUIStore((s) => s.openLogin)

  if (pathname === '/checkout') return null

  const homeActive = pathname === '/'
  const searchActive = pathname === '/search'
  const wishActive = pathname === '/wishlist'
  const accountActive = pathname === '/account'

  const handleAccount = () => {
    if (isLoggedIn) navigate('/account')
    else openLogin()
  }

  const tab = (active: boolean) =>
    `flex-1 flex flex-col items-center justify-center gap-[3px] font-body text-[10px] transition-colors duration-150 text-decoration-none cursor-pointer [-webkit-tap-highlight-color:transparent] active:scale-[0.88] ${active ? 'text-plum' : 'text-muted'}`

  return (
    <nav
      className="hidden max-[720px]:flex fixed bottom-0 inset-x-0 h-[calc(56px+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-bg border-t border-plate z-[100] shadow-[0_-2px_12px_rgba(26,15,29,0.06)]"
      role="navigation"
      aria-label="ناوبری اصلی"
    >
      <a
        href="/"
        className={tab(homeActive)}
        aria-current={homeActive ? 'page' : undefined}
        aria-label="خانه"
      >
        <Icon name="home" size={22} />
        <span>خانه</span>
      </a>

      <button className={tab(searchActive)} onClick={openSearch} aria-label="جستجو">
        <Icon name="search" size={22} />
        <span>جستجو</span>
      </button>

      <button className={tab(false)} onClick={openCart} aria-label="سبد خرید">
        <span className="relative flex items-center justify-center">
          <Icon name="bag" size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-[5px] -end-2 bg-copper text-white text-[9px] font-mono min-w-4 h-4 rounded-lg flex items-center justify-center px-[3px]">
              {cartCount > 9 ? '۹+' : toFa(cartCount)}
            </span>
          )}
        </span>
        <span>سبد</span>
      </button>

      <a
        href="/wishlist"
        className={tab(wishActive)}
        aria-current={wishActive ? 'page' : undefined}
        aria-label="علاقه‌مندی‌ها"
      >
        <span className="relative flex items-center justify-center">
          <Icon name={wishActive ? 'heart-filled' : 'heart'} size={22} />
          {wishCount > 0 && (
            <span className="absolute -top-[5px] -end-2 bg-plum text-bg text-[9px] font-mono min-w-4 h-4 rounded-lg flex items-center justify-center px-[3px]">
              {wishCount > 9 ? '۹+' : toFa(wishCount)}
            </span>
          )}
        </span>
        <span>علاقه‌مندی</span>
      </a>

      <button className={tab(accountActive)} onClick={handleAccount} aria-label="حساب کاربری">
        <Icon name="user" size={22} />
        <span>حساب</span>
      </button>
    </nav>
  )
}

export default BottomNav
