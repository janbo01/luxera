import { type FC } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Icon from '../icons/Icon'
import { toFa } from '../../utils/format'
import { useWishlistStore, selectWishlistCount } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import { useSearchStore } from '../../store/searchStore'
import { useUIStore } from '../../store/uiStore'

const BottomNav: FC = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const wishCount = useWishlistStore(selectWishlistCount)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const openSearch = useSearchStore((s) => s.open)
  const openLogin = useUIStore((s) => s.openLogin)

  if (pathname === '/checkout') return null

  const homeActive    = pathname === '/'
  const searchActive  = pathname === '/search'
  const wishActive    = pathname === '/wishlist'
  const accountActive = pathname === '/account'

  const handleAccount = () => {
    if (isLoggedIn) navigate('/account')
    else openLogin()
  }

  return (
    <nav className="bottom-nav" role="navigation" aria-label="ناوبری اصلی">
      <Link
        to="/"
        className={`bottom-nav__tab${homeActive ? ' is-active' : ''}`}
        aria-current={homeActive ? 'page' : undefined}
        aria-label="خانه"
      >
        <Icon name="home" size={22} />
        <span>خانه</span>
      </Link>

      <button
        className={`bottom-nav__tab${searchActive ? ' is-active' : ''}`}
        onClick={openSearch}
        aria-label="جستجو"
      >
        <Icon name="search" size={22} />
        <span>جستجو</span>
      </button>

      <Link
        to="/wishlist"
        className={`bottom-nav__tab${wishActive ? ' is-active' : ''}`}
        aria-current={wishActive ? 'page' : undefined}
        aria-label="علاقه‌مندی‌ها"
      >
        <span className="bottom-nav__icon-wrap">
          <Icon name={wishActive ? 'heart-filled' : 'heart'} size={22} />
          {wishCount > 0 && (
            <span className="bottom-nav__badge">
              {wishCount > 9 ? '۹+' : toFa(wishCount)}
            </span>
          )}
        </span>
        <span>علاقه‌مندی</span>
      </Link>

      <button
        className={`bottom-nav__tab${accountActive ? ' is-active' : ''}`}
        onClick={handleAccount}
        aria-label="حساب کاربری"
      >
        <Icon name="user" size={22} />
        <span>حساب</span>
      </button>
    </nav>
  )
}

export default BottomNav
