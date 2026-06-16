import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { useStoreTheme } from '../../hooks/useStoreTheme'
import { UI_DEFAULTS } from '../../utils/constants'
import ScrollToTop from './ScrollToTop'
import CartDrawer from '../cart/CartDrawer'
import SearchOverlay from '../search/SearchOverlay'
import LoginModal from '../account/LoginModal'
import BottomNav from './BottomNav'

function applyBodyAttrs(palette: string, density: string, heroVariant: string) {
  const b = document.body
  if (palette !== UI_DEFAULTS.palette) b.setAttribute('data-palette', palette)
  else b.removeAttribute('data-palette')
  if (density !== UI_DEFAULTS.density) b.setAttribute('data-density', density)
  else b.removeAttribute('data-density')
  if (heroVariant !== UI_DEFAULTS.heroVariant) b.setAttribute('data-hero', heroVariant)
  else b.removeAttribute('data-hero')
}

function LoginModalContainer() {
  const isLoginOpen = useUIStore((s) => s.isLoginOpen)
  const loginMessage = useUIStore((s) => s.loginMessage)
  const closeLogin = useUIStore((s) => s.closeLogin)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  if (!isLoginOpen || isLoggedIn) return null
  return <LoginModal onClose={closeLogin} message={loginMessage ?? undefined} />
}

export default function AppShell() {
  useStoreTheme()

  useEffect(() => {
    const { palette, density, heroVariant } = useUIStore.getState()
    applyBodyAttrs(palette, density, heroVariant)
    return useUIStore.subscribe(({ palette, density, heroVariant }) =>
      applyBodyAttrs(palette, density, heroVariant),
    )
  }, [])

  useEffect(() => {
    const handler = () => {
      useAuthStore.getState().clearSession()
      useUIStore.getState().openLogin('نشست شما منقضی شده. لطفاً مجدداً وارد شوید.')
    }
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [])

  return (
    <>
      <ScrollToTop />
      <CartDrawer />
      <SearchOverlay />
      <LoginModalContainer />
      <BottomNav />
    </>
  )
}
