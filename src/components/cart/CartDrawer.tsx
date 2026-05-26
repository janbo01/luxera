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
    // Reset inline styles when drawer closes externally (after swipe-to-dismiss)
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
      <div ref={overlayRef} className={`cart-overlay ${isOpen ? 'is-open' : ''}`} onClick={closeCart} />
      <aside
        ref={drawerRef}
        className={`cart ${isOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-label="سبد خرید"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="cart__head">
          <h3>
            سبد خرید
            <small>{toFa(totalQty)} قطعه</small>
          </h3>
          <button className="cart__close" onClick={closeCart} aria-label="بستن">
            <Icon name="close" size={14} />
          </button>
        </div>

        <div className="cart__body">
          {items.length === 0 ? (
            <div className="cart__empty">
              <span className="cart__empty-icon">
                <Icon name="bag" size={36} />
              </span>
              <h4>سبد شما خالی است</h4>
              <p>قطعاتی را که دوست دارید به سبد اضافه کنید تا اینجا ببینید.</p>
              <button className="btn btn--ghost btn--small" onClick={closeCart}>
                بازگشت به فروشگاه
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart__item">
                <div className="cart__item-media">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.fa} className="img-cover" />
                    : <Illustration name={item.illus} />}
                </div>
                <div>
                  <div className="cart__item-name">{item.fa}</div>
                  <span className="cart__item-name-en">{item.en}</span>
                  <div className="cart__item-meta">{item.meta.join(' · ')}</div>
                  <QuantityStepper
                    value={item.qty}
                    onDecrement={() => decrement(item.id)}
                    onIncrement={() => increment(item.id)}
                    className="cart__qty"
                  />
                </div>
                <div className="cart__item-price">
                  <span>{formatToman(item.price * item.qty)}</span>
                  <button className="cart__item-remove" onClick={() => remove(item.id)}>
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart__foot">
            <div className="cart__totals">
              <div className="row"><span>جمع جزء</span><span>{formatToman(subtotal)}</span></div>
              <div className="row">
                <span>ارسال</span>
                <span>{shipping === 0 ? 'رایگان' : formatToman(shipping)}</span>
              </div>
              <div className="row row--main">
                <span>قابل پرداخت</span>
                <span>{formatToman(total)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="cart__checkout"
              onClick={closeCart}
            >
              تکمیل سفارش — {formatToman(total)}
            </Link>
            <button className="cart__continue" onClick={closeCart}>
              یا، ادامه‌ی خرید
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

export default CartDrawer
