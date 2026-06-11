export function flyToCart(fromRect: DOMRect): void {
  const target = document.querySelector<HTMLElement>('.header__cart-btn')
  if (!target) return

  // Read destination rect before any DOM writes to avoid a forced reflow
  const toRect = target.getBoundingClientRect()
  const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2)
  const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2)

  const el = document.createElement('div')
  // Inline all required styles — no external .fly class needed
  el.style.cssText = `
    position:fixed;
    left:${fromRect.left + fromRect.width / 2 - 30}px;
    top:${fromRect.top + fromRect.height / 2 - 30}px;
    width:60px;height:60px;
    pointer-events:none;
    z-index:9999;
    color:var(--color-copper);
  `
  el.innerHTML = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1">
    <circle cx="100" cy="100" r="50"/>
    <circle cx="100" cy="100" r="20" fill="currentColor" opacity="0.5"/>
  </svg>`
  document.body.appendChild(el)

  // WAAPI — no forced reflow, no setTimeout
  el.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: '1' },
      { transform: `translate(${dx}px,${dy}px) scale(0.15)`, opacity: '0' },
    ],
    { duration: 900, easing: 'cubic-bezier(.4,0,.2,1)' },
  ).onfinish = () => el.remove()

  target.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.18)', offset: 0.6 },
      { transform: 'scale(1)' },
    ],
    { duration: 500, delay: 700, easing: 'cubic-bezier(.2,.7,.2,1)' },
  )
}
