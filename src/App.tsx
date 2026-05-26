import { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useUIStore } from './store/uiStore'
import { useAuthStore } from './store/authStore'

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
} from './app/router'

export default function App() {
  const palette = useUIStore((s) => s.palette)
  const density = useUIStore((s) => s.density)
  const heroVariant = useUIStore((s) => s.heroVariant)
  const isLoginOpen = useUIStore((s) => s.isLoginOpen)
  const loginMessage = useUIStore((s) => s.loginMessage)
  const openLogin = useUIStore((s) => s.openLogin)
  const closeLogin = useUIStore((s) => s.closeLogin)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const clearSession = useAuthStore((s) => s.clearSession)

  useEffect(() => {
    const b = document.body
    if (palette !== 'white') b.setAttribute('data-palette', palette)
    else b.removeAttribute('data-palette')
    if (density !== 'balanced') b.setAttribute('data-density', density)
    else b.removeAttribute('data-density')
    if (heroVariant !== 'default') b.setAttribute('data-hero', heroVariant)
    else b.removeAttribute('data-hero')
  }, [palette, density, heroVariant])

  useEffect(() => {
    const handler = () => {
      clearSession()
      openLogin('نشست شما منقضی شده. لطفاً مجدداً وارد شوید.')
    }
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [clearSession, openLogin])

  return (
    <ErrorBoundary>
      <BrowserRouter>
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
              <Route path="*"                    element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <CartDrawer />
          <SearchOverlay />
          {isLoginOpen && !isLoggedIn && <LoginModal onClose={closeLogin} message={loginMessage ?? undefined} />}
          <BottomNav />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
