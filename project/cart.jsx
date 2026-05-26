/* ============================================================
   Luxera — cart.jsx
   Mini-cart drawer + add-to-cart fly animation
============================================================ */

function CartDrawer({ open, items, onClose, onInc, onDec, onRemove }) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = subtotal > 0 && subtotal < 2000000 ? 180000 : 0;
  const total = subtotal + shipping;
  const totalQty = items.reduce((s, it) => s + it.qty, 0);

  // Lock body scroll while open
  React.useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <React.Fragment>
      <div className={`cart-overlay ${open ? 'is-open' : ''}`} onClick={onClose} />
      <aside className={`cart ${open ? 'is-open' : ''}`} role="dialog" aria-label="سبد خرید">
        <div className="cart__head">
          <h3>
            سبد خرید
            <small>{toFa(totalQty)} قطعه</small>
          </h3>
          <button className="cart__close" onClick={onClose} aria-label="بستن">
            <Icon name="close" size={14} />
          </button>
        </div>
        <div className="cart__body">
          {items.length === 0 ? (
            <div className="cart__empty">
              <div style={{display:'inline-flex'}}>
                <Icon name="bag" size={36} />
              </div>
              <h4>سبد شما خالی است</h4>
              <p>قطعاتی را که دوست دارید به سبد اضافه کنید تا اینجا ببینید.</p>
              <button className="btn btn--ghost btn--small" onClick={onClose}>
                بازگشت به فروشگاه
              </button>
            </div>
          ) : (
            items.map((it) => {
              const Comp = window[it.illus];
              return (
                <div key={it.id} className="cart__item">
                  <div className="cart__item-media" style={{color:'var(--ink)'}}>
                    <Comp />
                  </div>
                  <div>
                    <div className="cart__item-name">{it.fa}</div>
                    <span className="cart__item-name-en">{it.en}</span>
                    <div className="cart__item-meta">
                      {it.meta.join(' · ')}
                    </div>
                    <div className="cart__qty">
                      <button onClick={() => onDec(it.id)} aria-label="کم">
                        <Icon name="minus" size={12} />
                      </button>
                      <span>{toFa(it.qty)}</span>
                      <button onClick={() => onInc(it.id)} aria-label="زیاد">
                        <Icon name="plus" size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="cart__item-price">
                    <span>{formatToman(it.price * it.qty)}</span>
                    <button className="cart__item-remove" onClick={() => onRemove(it.id)}>
                      حذف
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {items.length > 0 && (
          <div className="cart__foot">
            <div className="cart__totals">
              <div className="row"><span>جمع جزء</span><span>{formatToman(subtotal)}</span></div>
              <div className="row"><span>ارسال</span><span>{shipping === 0 ? 'رایگان' : formatToman(shipping)}</span></div>
              <div className="row row--main"><span>قابل پرداخت</span><span>{formatToman(total)}</span></div>
            </div>
            <button className="cart__checkout">
              تکمیل سفارش — {formatToman(total)}
            </button>
            <button className="cart__continue" onClick={onClose}>یا، ادامه‌ی خرید</button>
          </div>
        )}
      </aside>
    </React.Fragment>
  );
}

// Fly-to-cart animation
function flyToCart(product, fromRect) {
  const target = document.querySelector('.header__actions button[aria-label="سبد خرید"]');
  if (!target || !fromRect) return;
  const toRect = target.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'fly';
  el.style.left = fromRect.left + fromRect.width / 2 - 30 + 'px';
  el.style.top  = fromRect.top + fromRect.height / 2 - 30 + 'px';
  el.innerHTML = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1"><circle cx="100" cy="100" r="50" stroke-width="1"/><circle cx="100" cy="100" r="20" fill="currentColor" opacity="0.5"/></svg>';
  document.body.appendChild(el);
  // force reflow then animate
  // eslint-disable-next-line
  el.offsetHeight;
  const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
  const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2);
  el.style.transform = `translate(${dx}px, ${dy}px) scale(0.15)`;
  el.style.opacity = '0';
  setTimeout(() => el.remove(), 950);
  // bounce target
  target.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.18)', offset: 0.6 },
    { transform: 'scale(1)' }
  ], { duration: 500, delay: 700, easing: 'cubic-bezier(.2,.7,.2,1)' });
}

Object.assign(window, { CartDrawer, flyToCart });
