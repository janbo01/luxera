import { useEffect, useRef, type FC } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../icons/Icon'
import { Illustration } from '../../illustrations'
import { formatToman, toFa } from '../../utils/format'
import { useCartStore } from '../../store/cartStore'
import { useBodyLock } from '../../hooks/useBodyLock'
import QuantityStepper from '../shared/QuantityStepper'
import { calcSimpleShipping } from '../../data/shipping'

const CartDrawer: FC = () => {
  const items     = useCartStore((s) => s.items)
  const isOpen    = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const increment = useCartStore((s) => s.increment)
  const decrement = useCartStore((s) => s.decrement)
  const remove    = useCartStore((s) => s.remove)

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0)
  const shipping = calcSimpleShipping(subtotal)
  const total = subtotal + shipping
  const totalQty = items.reduce((s, it) => s + it.qty, 0)

  const drawerRef    = useRef<HTMLElement>(null)
  const overlayRef   = useRef<HTMLDivElement>(null)
  const touchStartX  = useRef(0)
  const touchStartMs = useRef(0)
  const dragX        = useRef(0)

  useBodyLock(isOpen)

  useEffect(() => {
    if (!isOpen && drawerRef.current) {
      drawerRef.current.style.transition = ''
      drawerRef.current.style.transform  = ''
    }
    if (!isOpen && overlayRef.current) {
      overlayRef.current.style.transition = ''
      overlayRef.current.style.opacity    = ''
    }
  }, [isOpen])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current  = e.touches[0].clientX
    touchStartMs.current = e.timeStamp
    dragX.current        = 0
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current
    if (dx <= 0) return
    dragX.current = dx
    const el = drawerRef.current
    const ov = overlayRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.transform  = `translateX(${dx}px)`
    if (ov) {
      const w       = Math.min(320, window.innerWidth * 0.88)
      const opacity = Math.max(0, (1 - dx / w) * 0.45)
      ov.style.transition = 'none'
      ov.style.opacity    = String(opacity)
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx       = dragX.current
    const dt       = e.timeStamp - touchStartMs.current
    const velocity = dt > 0 ? dx / dt : 0
    const w        = Math.min(320, window.innerWidth * 0.88)
    const el       = drawerRef.current
    const ov       = overlayRef.current
    if (!el) return

    if (dx > w * 0.4 || velocity > 0.5) {
      el.style.transition = 'transform 220ms ease-in'
      el.style.transform  = 'translateX(100%)'
      if (ov) {
        ov.style.transition = 'opacity 220ms ease-in'
        ov.style.opacity    = '0'
      }
      setTimeout(closeCart, 220)
    } else {
      el.style.transition = 'transform 280ms cubic-bezier(.25,.7,.25,1)'
      el.style.transform  = 'translateX(0)'
      if (ov) {
        ov.style.transition = ''
        ov.style.opacity    = ''
      }
    }
    dragX.current = 0
  }

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-[rgba(17,17,17,0.4)] backdrop-blur-[2px] z-[120] transition-opacity duration-[350ms] ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 bottom-0 right-0 w-[min(440px,100vw)] bg-surface z-[130] flex flex-col shadow-[-6px_0_40px_rgba(0,0,0,0.08)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.2,0.7,0.2,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="سبد خرید"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Head */}
        <div className="flex items-center justify-between px-7 py-6 border-b border-rule">
          <h2 className="font-body font-light text-[22px] m-0 flex items-baseline gap-2">
            سبد خرید
            <small className="font-mono text-[11px] text-muted font-normal">{toFa(totalQty)} قطعه</small>
          </h2>
          <button
            className="w-9 h-9 flex items-center justify-center border border-rule rounded-full transition-colors duration-200 hover:bg-plate"
            onClick={closeCart}
            aria-label="بستن"
          >
            <Icon name="close" size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-2">
          {items.length === 0 ? (
            <div className="text-center py-20 px-5 text-muted">
              <span className="inline-flex">
                <Icon name="bag" size={36} />
              </span>
              <h3 className="font-body font-light text-[22px] text-ink mt-4 mb-2">سبد شما خالی است</h3>
              <p className="text-[13px] max-w-[24ch] mx-auto mt-0 mb-6">قطعاتی را که دوست دارید به سبد اضافه کنید تا اینجا ببینید.</p>
              <button
                className="inline-flex items-center gap-2.5 px-[18px] py-2.5 text-xs font-medium tracking-[0.01em] border border-ink bg-transparent text-ink rounded-full transition-all duration-200 hover:bg-ink hover:text-bg hover:-translate-y-px"
                onClick={closeCart}
              >
                بازگشت به فروشگاه
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="grid grid-cols-[80px_1fr_auto] gap-4 py-5 border-b border-rule items-start">
                <div className="bg-plate aspect-square flex items-center justify-center text-ink rounded-[var(--radius)] overflow-hidden [&>svg]:w-[70%] [&>svg]:h-auto">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.fa} className="w-full h-full object-cover" />
                    : <Illustration name={item.illus} />}
                </div>
                <div>
                  <div className="text-[13px] font-normal mb-1 leading-[1.4]">{item.fa}</div>
                  <span className="font-display italic text-[11px] text-muted">{item.en}</span>
                  <div className="font-mono text-[10px] text-muted tracking-[0.08em] mt-1.5">{item.meta.join(' · ')}</div>
                  <QuantityStepper
                    value={item.qty}
                    onDecrement={() => decrement(item.id)}
                    onIncrement={() => increment(item.id)}
                    className="inline-flex items-center gap-2 mt-2.5 border border-rule rounded-full px-2.5 py-1 font-mono text-xs [&>button]:w-[18px] [&>button]:h-[18px] [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:text-muted hover:[&>button]:text-ink"
                  />
                </div>
                <div className="text-end text-[13px] [font-feature-settings:'tnum'] flex flex-col items-end gap-2">
                  <span>{formatToman(item.price * item.qty)}</span>
                  <button
                    className="text-[11px] text-muted border-b border-transparent transition-colors duration-200 hover:text-sale hover:border-sale"
                    onClick={() => remove(item.id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-rule px-7 pt-6 pb-7 bg-surface">
            <div className="flex flex-col gap-2 mb-[18px] text-[13px]">
              <div className="flex justify-between text-muted"><span>جمع جزء</span><span>{formatToman(subtotal)}</span></div>
              <div className="flex justify-between text-muted"><span>ارسال</span><span>{shipping === 0 ? 'رایگان' : formatToman(shipping)}</span></div>
              <div className="flex justify-between text-ink pt-3 mt-1.5 border-t border-rule text-base font-normal [font-feature-settings:'tnum']">
                <span>قابل پرداخت</span><span>{formatToman(total)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full text-center bg-plum text-bg py-4 text-sm font-body tracking-[0.04em] border border-plum rounded-full transition-all duration-200 hover:bg-transparent hover:text-plum"
              onClick={closeCart}
            >
              تکمیل سفارش — {formatToman(total)}
            </Link>
            <button
              className="block text-center w-full mt-3 text-xs text-muted underline underline-offset-4"
              onClick={closeCart}
            >
              یا، ادامه‌ی خرید
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

export default CartDrawer
