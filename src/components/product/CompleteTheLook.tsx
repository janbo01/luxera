import { useEffect, useState, memo, type FC } from 'react'

import SectionHeader from '../shared/SectionHeader'
import ProductCard from './ProductCard'
import { useCartStore } from '../../store/cartStore'
import { CATEGORIES } from '../../data/categories'
import { listCategories, listProducts, adaptProduct } from '../../api/product'
import type { Product } from '../../types'

interface CompleteTheLookProps {
  categoryId: string
  excludeId?: string
}

/** Which other categories pair naturally with the one being viewed. */
const PAIRS: Record<string, string[]> = {
  necklaces: ['earrings', 'bracelets'],
  earrings: ['necklaces', 'rings'],
  rings: ['bracelets', 'earrings'],
  bracelets: ['rings', 'necklaces'],
}
const DEFAULT_PAIRS = ['necklaces', 'earrings']

/** One in-stock piece from each paired category, so a single product page can build an outfit. */
const CompleteTheLook: FC<CompleteTheLookProps> = ({ categoryId, excludeId }) => {
  const addItem = useCartStore((s) => s.addItem)
  const [picks, setPicks] = useState<Product[]>([])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const cats = await listCategories()
        const current = cats.find((c) => c.id === categoryId)
        const currentSlug = CATEGORIES.find((c) => c.fa === current?.name)?.id ?? ''
        const wanted = (PAIRS[currentSlug] ?? DEFAULT_PAIRS).filter((slug) => slug !== currentSlug)
        const results = await Promise.all(
          wanted.map(async (slug) => {
            const fa = CATEGORIES.find((c) => c.id === slug)?.fa
            const id = cats.find((c) => c.name === fa)?.id
            if (!id) return null
            const { items } = await listProducts({ categoryId: id, limit: 4 })
            const pick = items.find((p) => p.id !== excludeId && p.stock_count !== 0)
            return pick ? adaptProduct(pick) : null
          }),
        )
        if (!cancelled) setPicks(results.filter((p): p is Product => p !== null))
      } catch {
        /* the strip is optional */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [categoryId, excludeId])

  if (picks.length === 0) return null

  return (
    <section
      className="page-section page-section--compact cv-auto"
      aria-label="ست کردن با این قطعه"
    >
      <SectionHeader
        size="sm"
        title={
          <>
            با این قطعه <em>ست کنید</em>
          </>
        }
      />
      <div className="products-grid cols-4">
        {picks.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={addItem} />
        ))}
      </div>
    </section>
  )
}

export default memo(CompleteTheLook)
