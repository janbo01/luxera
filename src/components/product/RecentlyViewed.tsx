import { memo, type FC } from 'react'

import SectionHeader from '../shared/SectionHeader'
import ProductCard from './ProductCard'
import { useCartStore } from '../../store/cartStore'
import { useRecentStore } from '../../store/recentStore'
import { useHydrated } from '../../hooks/useHydrated'

interface RecentlyViewedProps {
  /** Hide the product currently being viewed. */
  excludeId?: string
  /** Fewer than this many items and the strip stays hidden. */
  min?: number
}

const CARD_W = 'clamp(150px,42vw,230px)'

/** Last products the shopper opened. Stored on-device, so it needs no account. */
const RecentlyViewed: FC<RecentlyViewedProps> = ({ excludeId, min = 2 }) => {
  const hydrated = useHydrated()
  const addItem = useCartStore((s) => s.addItem)
  const items = useRecentStore((s) => s.items)

  // The server never knows what this visitor viewed, so render nothing until hydrated.
  if (!hydrated) return null
  const list = items.filter((p) => p.id !== excludeId).slice(0, 6)
  if (list.length < min) return null

  return (
    <section className="page-section cv-auto" aria-label="بازدیدهای اخیر">
      <SectionHeader
        kicker="Recently viewed"
        title={
          <>
            بازدیدهای <em>اخیر</em>
          </>
        }
      />
      <div className="flex gap-3.5 sm:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 -mx-[var(--pad)] px-[var(--pad)] scroll-px-[var(--pad)] [direction:rtl]">
        {list.map((p) => (
          <div key={p.id} className="snap-start flex-shrink-0" style={{ width: CARD_W }}>
            <ProductCard product={p} onAdd={addItem} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default memo(RecentlyViewed)
