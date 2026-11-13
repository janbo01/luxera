import { useEffect, useRef, useState, type FC } from 'react'
import Icon from '../icons/Icon'
import { useCartStore } from '../../store/cartStore'
import { usePathname } from '../../hooks/usePathname'

const VISIBLE_MS = 3600

/**
 * "Added to cart" confirmation. The fly-to-cart animation and the badge bump are easy
 * to miss — especially on phones, where the bag sits in the bottom nav — so a short,
 * polite live-region toast confirms the add and offers a one-tap route to the cart.
 */
const CartToast: FC = () => {
  const isCartOpen = useCartStore((s) => s.isOpen)
  const pathname = usePathname()
  // Sit above whichever bar owns the bottom of a phone screen: the buy bar on product
  // pages, the filter/sort bar on listings, the bottom nav everywhere else.
  const ownBar = pathname.startsWith('/product/') || pathname.startsWith('/category/')
  const openCart = useCartStore((s) => s.openCart)
  const [shown, setShown] = useState<{ name: string; at: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = useCartStore.subscribe((state, prev) => {
      // The drawer already confirms the add when it's open (e.g. from the product page).
      if (!state.lastAdded || state.lastAdded === prev.lastAdded || state.isOpen) return
      setShown(state.lastAdded)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setShown(null), VISIBLE_MS)
    })
    return () => {
      unsubscribe()
      window.clearTimeout(timer.current)
    }
  }, [])

  const visible = shown !== null && !isCartOpen

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 z-[150] flex justify-center px-4 pointer-events-none bottom-6 ${
        ownBar
          ? 'max-[1100px]:bottom-[calc(80px+env(safe-area-inset-bottom))]'
          : 'max-[720px]:bottom-[calc(56px+env(safe-area-inset-bottom)+12px)]'
      }`}
    >
      {visible && (
        <div
          key={shown.at}
          className="pointer-events-auto flex items-center gap-3 w-full max-w-[420px] ps-4 pe-2 py-2 rounded-full bg-ink text-bg shadow-[var(--shadow-lift)] animate-sg-fade"
        >
          <span className="w-7 h-7 shrink-0 rounded-full bg-ok grid place-items-center text-white">
            <Icon name="check" size={15} strokeWidth={2.4} />
          </span>
          <span className="flex-1 min-w-0 text-[14px] leading-[1.5]">
            <span className="block truncate font-medium">{shown.name}</span>
            <span className="block text-[12.5px] text-bg/75">به سبد خرید اضافه شد</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setShown(null)
              openCart()
            }}
            className="shrink-0 h-11 px-4 rounded-full bg-bg text-ink text-[13.5px] font-medium transition-colors duration-200 hover:bg-bg-2"
          >
            مشاهده‌ی سبد
          </button>
        </div>
      )}
    </div>
  )
}

export default CartToast
