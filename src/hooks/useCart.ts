import { useShallow } from 'zustand/react/shallow'
import { useCartStore } from '../store/cartStore'
import { flyToCart } from '../utils/flyToCart'
import type { Product } from '../types'

export function useCart() {
  const { items, isOpen, addItem, increment, decrement, remove, clearCart, openCart, closeCart } =
    useCartStore(
      useShallow((s) => ({
        items: s.items,
        isOpen: s.isOpen,
        addItem: s.addItem,
        increment: s.increment,
        decrement: s.decrement,
        remove: s.remove,
        clearCart: s.clearCart,
        openCart: s.openCart,
        closeCart: s.closeCart,
      })),
    )

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0)
  const totalQty = items.reduce((sum, it) => sum + it.qty, 0)

  const addWithAnimation = (product: Product, fromRect?: DOMRect) => {
    addItem(product)
    if (fromRect) flyToCart(fromRect)
  }

  return {
    items,
    isOpen,
    subtotal,
    totalQty,
    addItem,
    addWithAnimation,
    increment,
    decrement,
    remove,
    clearCart,
    openCart,
    closeCart,
  }
}
