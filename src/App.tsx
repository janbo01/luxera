import { Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useUIStore } from './store/uiStore'
import { useAuthStore } from './store/authStore'
import { useStoreTheme } from './hooks/useStoreTheme'
import ScrollToTop from './components/layout/ScrollToTop'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import BottomNav from './components/layout/BottomNav'
import CartDrawer from './components/cart/CartDrawer'
import SearchOverlay from './components/search/SearchOverlay'
import LoginModal from './components/account/LoginModal'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import PageLoader from './components/shared/PageLoader'
import {
  HomePage,
  ProductPage,
  CategoryPage,
  CheckoutPage,
  WishlistPage,
  AccountPage,
  SearchResultsPage,
  CollectionsPage,
  CollectionDetailPage,
  AboutPage,
  FaqPage,
  ShippingPage,
  PrivacyPage,
  TermsPage,
  ContactPage,
  NotFoundPage,
  BlogListPage,
  BlogDetailPage,
} from './app/router'

function applyBodyAttrs(palette: string, density: string, heroVariant: string) {
  const b = document.body
  if (palette !== 'white') b.setAttribute('data-palette', palette)
  else b.removeAttribute('data-palette')
  if (density !== 'balanced') b.setAttribute('data-density', density)
  else b.removeAttribute('data-density')
  if (heroVariant !== 'default') b.setAttribute('data-hero', heroVariant)
  else b.removeAttribute('data-hero')
}

// Isolated so only this subtree re-renders when the login modal opens/closes
function LoginModalContainer() {
  const isLoginOpen = useUIStore((s) => s.isLoginOpen)
  const loginMessage = useUIStore((s) => s.loginMessage)
  const closeLogin = useUIStore((s) => s.closeLogin)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  if (!isLoginOpen || isLoggedIn) return null
  return <LoginModal onClose={closeLogin} message={loginMessage ?? undefined} />
}

export default function App() {
  useStoreTheme()

  // Don't subscribe reactively — palette/density/heroVariant are only needed as
  // DOM attributes, not in the render tree. Subscribing via getState/subscribe
  // prevents App (and its whole subtree) from re-rendering on theme changes.
  useEffect(() => {
    const { palette, density, heroVariant } = useUIStore.getState()
    applyBodyAttrs(palette, density, heroVariant)
    return useUIStore.subscribe(({ palette, density, heroVariant }) =>
      applyBodyAttrs(palette, density, heroVariant),
    )
  }, [])

  // Access stores via getState() so this effect never re-runs and App never
  // re-renders when the session/login state changes — LoginModalContainer owns that.
  useEffect(() => {
    const handler = () => {
      useAuthStore.getState().clearSession()
      useUIStore.getState().openLogin('نشست شما منقضی شده. لطفاً مجدداً وارد شوید.')
    }
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [])

  return (
    <ErrorBoundary>
      <>
        <ScrollToTop />
        <div>
          <Header />
          <main>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/"                    element={<HomePage />} />
              <Route path="/product/:id"         element={<ProductPage />} />
              <Route path="/category/:id"        element={<CategoryPage />} />
              <Route path="/checkout"            element={<CheckoutPage />} />
              <Route path="/wishlist"            element={<WishlistPage />} />
              <Route path="/account"             element={<AccountPage />} />
              <Route path="/search"              element={<SearchResultsPage />} />
              <Route path="/collections"         element={<CollectionsPage />} />
              <Route path="/collections/:slug"   element={<CollectionDetailPage />} />
              <Route path="/about"               element={<AboutPage />} />
              <Route path="/faq"                 element={<FaqPage />} />
              <Route path="/shipping"            element={<ShippingPage />} />
              <Route path="/privacy"             element={<PrivacyPage />} />
              <Route path="/terms"               element={<TermsPage />} />
              <Route path="/contact"             element={<ContactPage />} />
              <Route path="/blog"                element={<BlogListPage />} />
              <Route path="/blog/:slug"          element={<BlogDetailPage />} />
              <Route path="*"                    element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <CartDrawer />
          <SearchOverlay />
          <LoginModalContainer />
          <BottomNav />
        </div>
      </>
    </ErrorBoundary>
  )
}
