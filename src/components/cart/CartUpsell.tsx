import { useEffect, useMemo, useState, type FC } from 'react'

import Icon from '../icons/Icon'
import { Illustration } from '../../illustrations'
import { listProducts, adaptProduct } from '../../api/product'
import { useCartStore } from '../../store/cartStore'
import { formatToman } from '../../utils/format'
import { imgUrl } from '../../utils/cdnImage'
import type { Product } from '../../types'

interface CartUpsellProps {
  /** Toman still missing for free shipping. */
  remaining: number
  /** Ids already in the cart, so we never suggest a duplicate. */
  inCartIds: string[]
  /** Only fetch once the drawer has been opened. */
  active: boolean
}

/** One suggestion that closes the free-shipping gap, priced as close above it as possible. */
const CartUpsell: FC<CartUpsellProps> = ({ remaining, inCartIds, active }) => {
  const addItem = useCartStore((s) => s.addItem)
  const [pool, setPool] = useState<Product[] | null>(null)

  useEffect(() => {
    if (!active || pool) return
    let cancelled = false
    listProducts({ limit: 40 })
      .then(({ items }) => !cancelled && setPool(items.map((p) => adaptProduct(p))))
      .catch(() => !cancelled && setPool([]))
    return () => {
      cancelled = true
    }
  }, [active, pool])

  const pick = useMemo(() => {
    if (!pool || remaining <= 0) return null
    const free = pool.filter((p) => !inCartIds.includes(p.id) && p.stockCount !== 0)
    const closes = free.filter((p) => p.price >= remaining).sort((a, b) => a.price - b.price)
    // Nothing clears the gap in one go: offer the priciest piece so the bar moves furthest.
    return closes[0] ?? [...free].sort((a, b) => b.price - a.price)[0] ?? null
  }, [pool, remaining, inCartIds])

  if (!pick) return null
  const closesGap = pick.price >= remaining

  return (
    <div className="my-5 rounded-[var(--radius)] bg-bg-2/70 ring-1 ring-inset ring-rule p-4">
      <p className="m-0 mb-3 text-[12.5px] text-ink-2">
        {closesGap
          ? 'با افزودن این قطعه، ارسال سفارش رایگان می‌شود'
          : `${formatToman(remaining)} تا ارسال رایگان باقی مانده است`}
      </p>
      <div className="grid grid-cols-[56px_1fr_auto] gap-3 items-center">
        <a
          href={`/product/${pick.slug ?? pick.id}`}
          className="w-14 h-14 rounded-[var(--radius-sm)] bg-plate overflow-hidden grid place-items-center [&>svg]:w-[70%] [&>svg]:h-auto"
          aria-label={pick.fa}
        >
          {pick.imageUrl ? (
            <img
              src={imgUrl(pick.imageUrl, 112, 112)}
              alt=""
              width={56}
              height={56}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <Illustration name={pick.illus} />
          )}
        </a>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-ink truncate">{pick.fa}</div>
          <div className="text-[12.5px] text-muted [font-feature-settings:'tnum']">
            {formatToman(pick.price)}
          </div>
        </div>
        <button
          onClick={() => addItem(pick)}
          className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-full border border-ink text-[13px] text-ink cursor-pointer transition-colors hover:bg-ink hover:text-bg"
        >
          <Icon name="plus" size={13} />
          افزودن
        </button>
      </div>
    </div>
  )
}

export default CartUpsell
