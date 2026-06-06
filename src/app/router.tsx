import { lazy } from 'react'

import HomePage from '../pages/HomePage'

export const ProductPage         = lazy(() => import('../pages/ProductPage'))
export const CategoryPage        = lazy(() => import('../pages/CategoryPage'))
export const CheckoutPage        = lazy(() => import('../pages/CheckoutPage'))
export const WishlistPage        = lazy(() => import('../pages/WishlistPage'))
export const AccountPage         = lazy(() => import('../pages/AccountPage'))
export const SearchResultsPage   = lazy(() => import('../pages/SearchResultsPage'))
export const CollectionsPage     = lazy(() => import('../pages/CollectionsPage'))
export const CollectionDetailPage = lazy(() => import('../pages/CollectionDetailPage'))
export const AboutPage           = lazy(() => import('../pages/static/AboutPage'))
export const FaqPage             = lazy(() => import('../pages/static/FaqPage'))
export const ShippingPage        = lazy(() => import('../pages/static/ShippingPage'))
export const PrivacyPage         = lazy(() => import('../pages/static/PrivacyPage'))
export const TermsPage           = lazy(() => import('../pages/static/TermsPage'))
export const ContactPage         = lazy(() => import('../pages/static/ContactPage'))
export const NotFoundPage        = lazy(() => import('../pages/NotFoundPage'))
export const BlogListPage        = lazy(() => import('../pages/BlogListPage'))
export const BlogDetailPage      = lazy(() => import('../pages/BlogDetailPage'))

export { HomePage }
