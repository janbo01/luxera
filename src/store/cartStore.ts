import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../utils/constants'
import type { CartItem, Product } from '../types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  remove: (id: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((x) => x.id === product.id)
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(existing ? [8] : [15])
          }
          if (existing) {
            const maxQty = existing.stockCount ?? Infinity
            if (existing.qty >= maxQty) return state
            return {
              items: state.items.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x)),
            }
          }
          if ((product.stockCount ?? 1) < 1) return state
          return { items: [...state.items, { ...product, qty: 1 }] }
        }),

      increment: (id) =>
        set((state) => ({
          items: state.items.map((x) => {
            if (x.id !== id) return x
            const maxQty = x.stockCount ?? Infinity
            if (x.qty >= maxQty) return x
            return { ...x, qty: x.qty + 1 }
          }),
        })),

      decrement: (id) =>
        set((state) => ({
          items: state.items.map((x) => (x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x)),
        })),

      remove: (id) => set((state) => ({ items: state.items.filter((x) => x.id !== id) })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: STORAGE_KEYS.cart,
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

export const selectTotalQty = (state: CartState) => state.items.reduce((s, it) => s + it.qty, 0)
