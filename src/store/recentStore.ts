import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../utils/constants'
import type { Product } from '../types'

const MAX_RECENT = 8

interface RecentState {
  items: Product[]
  /** Moves the product to the front; keeps only the newest MAX_RECENT. */
  add: (product: Product) => void
  clear: () => void
}

/** Lean copy so persisted entries stay small (no meta arrays or long text). */
function slim(p: Product): Product {
  return {
    id: p.id,
    slug: p.slug,
    fa: p.fa,
    en: p.en,
    cat: p.cat,
    catId: p.catId,
    price: p.price,
    oldPrice: p.oldPrice,
    badge: p.badge,
    badgeKind: p.badgeKind,
    illus: p.illus,
    illusAlt: p.illusAlt,
    meta: [],
    imageUrl: p.imageUrl,
    imageUrlAlt: p.imageUrlAlt,
    stockCount: p.stockCount,
  }
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      add: (product) =>
        set((state) => ({
          items: [slim(product), ...state.items.filter((x) => x.id !== product.id)].slice(
            0,
            MAX_RECENT,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: STORAGE_KEYS.recent },
  ),
)
