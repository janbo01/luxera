import { useCallback } from 'react'
import { useWishlistStore } from '../store/wishlistStore'
import type { Product } from '../types'

export const useWishlist = (product: Product) => {
  const toggle = useWishlistStore((s) => s.toggle)
  const has = useWishlistStore((s) => s.has)
  const handleToggle = useCallback(() => toggle(product), [toggle, product])
  return { wishlisted: has(product.id), toggle: handleToggle }
}
