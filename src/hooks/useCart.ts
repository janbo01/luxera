import { useCartStore } from '../store/cartStore'
import { flyToCart } from '../utils/flyToCart'
import type { Product } from '../types'

export function useCart() {
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const addItem = useCartStore((s) => s.addItem)
  const increment = useCartStore((s) => s.increment)
  const decrement = useCartStore((s) => s.decrement)
  const remove = useCartStore((s) => s.remove)
  const clearCart = useCartStore((s) => s.clearCart)
  const openCart = useCartStore((s) => s.openCart)
  const closeCart = useCartStore((s) => s.closeCart)

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
