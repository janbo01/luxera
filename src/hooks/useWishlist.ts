import { useCallback } from 'react'
import { useWishlistStore } from '../store/wishlistStore'
import { useHydrated } from './useHydrated'
import type { Product } from '../types'

export const useWishlist = (product: Product) => {
  const hydrated = useHydrated()
  const toggle = useWishlistStore((s) => s.toggle)
  const has = useWishlistStore((s) => s.has)
  const handleToggle = useCallback(() => toggle(product), [toggle, product])
  // Gate on hydration: the wishlist is persisted in localStorage, so the server always
  // renders "not wishlisted". Reflecting the persisted value before mount would mismatch
  // SSR and crash hydration (React #418). After mount the real state is shown.
  return { wishlisted: hydrated && has(product.id), toggle: handleToggle }
}
