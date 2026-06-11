import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../utils/constants'
import type { Product } from '../types'
import * as userApi from '../api/user'
import { batchProducts, type ApiBatchItem } from '../api/product'

function isLoggedIn(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.auth)
    if (!raw) return false
    return JSON.parse(raw)?.state?.isLoggedIn === true
  } catch {
    return false
  }
}

function batchItemToProduct(b: ApiBatchItem): Product {
  return {
    id: b.id,
    slug: b.slug ?? undefined,
    fa: b.title,
    en: b.title,
    cat: '',
    catId: '',
    price: parseFloat(b.price),
    oldPrice: null,
    badge: null,
    illus: 'NecklaceB',
    illusAlt: 'NecklaceC',
    meta: [],
    imageUrl: b.image_url || undefined,
  }
}

interface WishlistState {
  items: Product[]
  toggle: (product: Product) => void
  remove: (id: string) => void
  has: (id: string) => boolean
  clear: () => void
  syncFromServer: () => Promise<void>
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const exists = get().items.some((x) => x.id === product.id)
        set((state) => ({
          items: exists
            ? state.items.filter((x) => x.id !== product.id)
            : [...state.items, product],
        }))
        if (isLoggedIn()) {
          if (exists) {
            userApi.removeWishlistItem(product.id).catch(() => {})
          } else {
            userApi.addWishlistItem(product.id).catch(() => {})
          }
        }
      },

      remove: (id) => {
        set((state) => ({ items: state.items.filter((x) => x.id !== id) }))
        if (isLoggedIn()) {
          userApi.removeWishlistItem(id).catch(() => {})
        }
      },

      has: (id) => get().items.some((x) => x.id === id),

      clear: () => set({ items: [] }),

      syncFromServer: async () => {
        try {
          const serverItems = await userApi.getWishlist()
          if (!serverItems.length) {
            set({ items: [] })
            return
          }
          const ids = serverItems.map((i) => i.product_id)
          const batch = await batchProducts(ids)
          const products = batch.map(batchItemToProduct)
          set({ items: products })
        } catch {
          // Network errors don't clear local wishlist
        }
      },
    }),
    { name: STORAGE_KEYS.wishlist },
  ),
)

export const selectWishlistCount = (state: WishlistState) => state.items.length
