export function flyToCart(fromRect: DOMRect): void {
  const target = document.querySelector<HTMLElement>('.header__cart-btn')
  if (!target) return

  const toRect = target.getBoundingClientRect()
  const el = document.createElement('div')
  el.className = 'fly'
  el.style.left = fromRect.left + fromRect.width / 2 - 30 + 'px'
  el.style.top = fromRect.top + fromRect.height / 2 - 30 + 'px'
  el.innerHTML = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="100" cy="100" r="50" stroke-width="1"/>
    <circle cx="100" cy="100" r="20" fill="currentColor" opacity="0.5"/>
  </svg>`
  document.body.appendChild(el)

  // force reflow then animate
  void el.offsetHeight

  const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2)
  const dy = toRect.top + toRect.height / 2 - (fromRect.top + fromRect.height / 2)
  el.style.transform = `translate(${dx}px, ${dy}px) scale(0.15)`
  el.style.opacity = '0'
  setTimeout(() => el.remove(), 950)

  target.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: 0.6 }, { transform: 'scale(1)' }],
    { duration: 500, delay: 700, easing: 'cubic-bezier(.2,.7,.2,1)' }
  )
}
