import { memo, useEffect, useState, type FC } from 'react'

import SectionHeader from '../shared/SectionHeader'
import ProductCard from './ProductCard'
import { useCartStore } from '../../store/cartStore'
import { useRecentStore } from '../../store/recentStore'
import { useHydrated } from '../../hooks/useHydrated'
import { batchProducts } from '../../api/product'

interface RecentlyViewedProps {
  /** Hide the product currently being viewed. */
  excludeId?: string
  /** Fewer than this many in-stock items and the strip stays hidden. */
  min?: number
}

const CARD_W = 'clamp(150px,42vw,230px)'
const MAX_SHOWN = 6

/**
 * Last products the shopper opened. Stored on-device, so it needs no account.
 * Only items still in stock are shown: the stored stock count is a snapshot from the
 * visit, so it is refreshed from the API before deciding what to show.
 */
const RecentlyViewed: FC<RecentlyViewedProps> = ({ excludeId, min = 2 }) => {
  const hydrated = useHydrated()
  const addItem = useCartStore((s) => s.addItem)
  const items = useRecentStore((s) => s.items)
  // id → current stock; undefined until the refresh answers (or if it fails).
  const [liveStock, setLiveStock] = useState<Record<string, number | undefined>>()

  const idKey = items.map((p) => p.id).join(',')
  useEffect(() => {
    if (!hydrated || !idKey) return
    let cancelled = false
    batchProducts(idKey.split(','))
      .then((rows) => {
        if (!cancelled) setLiveStock(Object.fromEntries(rows.map((r) => [r.id, r.stock_count])))
      })
      // Failed refresh: fall back to the stored snapshot rather than never showing.
      .catch(() => {
        if (!cancelled) setLiveStock({})
      })
    return () => {
      cancelled = true
    }
  }, [hydrated, idKey])

  // The server never knows what this visitor viewed, so render nothing until hydrated —
  // and until the stock refresh answers: showing the stored list first and then dropping
  // sold-out items (or the whole strip, under `min`) moved the page twice.
  if (!hydrated || (idKey && !liveStock)) return null
  const list = items
    .filter((p) => p.id !== excludeId)
    .map((p) => {
      const live = liveStock?.[p.id]
      return live === undefined ? p : { ...p, stockCount: live }
    })
    .filter((p) => p.stockCount !== 0)
    .slice(0, MAX_SHOWN)
  if (list.length < min) return null

  return (
    <section className="page-section page-section--compact cv-auto" aria-label="بازدیدهای اخیر">
      <SectionHeader
        size="sm"
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
