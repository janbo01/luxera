import { useEffect, useState, useMemo, memo, type FC, type ReactNode } from 'react'

import ProductCard from '../product/ProductCard'
import SectionHeader from '../shared/SectionHeader'
import CarouselArrows from '../shared/CarouselArrows'
import { useCartStore } from '../../store/cartStore'
import { listProducts, listCategories, adaptProduct, type ApiProduct } from '../../api/product'
import { useCarousel } from '../../hooks/useCarousel'
import { useHydrated } from '../../hooks/useHydrated'
import ViewAllLink from '../shared/ViewAllLink'
import { CATEGORIES } from '../../data/categories'
import { readHomeInitial } from './homeInitial'
import { isSoldOut, RAIL_FETCH, RAIL_SIZE } from '../../utils/stock'
import type { Product } from '../../types'

interface ProductCarouselProps {
  kicker?: string
  title: ReactNode
  link: string
  sectionId: string
  catSlug?: string
  /** Render on the tinted band background to break up consecutive carousels. */
  band?: boolean
  /** Rendered between the section header and the product row (e.g. category tabs). */
  subHeader?: ReactNode
  /** Header weight; see SectionHeader. */
  headerSize?: 'lg' | 'sm'
}

// ~2.2 cards visible on phones (the peek signals the row scrolls), ~4.5 on desktop.
const CARD_W = 'clamp(150px,42vw,272px)'

const SkeletonCard = () => (
  <div className="animate-pulse flex-shrink-0" style={{ width: CARD_W }}>
    <div className="aspect-square bg-plate rounded-[var(--radius)]" />
    <div className="pt-3.5 flex flex-col gap-2.5">
      <div className="h-4 bg-plate rounded w-4/5" />
      <div className="h-4 bg-plate rounded w-3/5" />
      <div className="h-5 bg-plate rounded w-2/5 mt-1" />
    </div>
  </div>
)

const SKELETONS = Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} />)

const CAT_FA_MAP = new Map(CATEGORIES.map((c) => [c.id, c.fa]))

async function resolveCategoryId(slug: string): Promise<string | undefined> {
  if (slug === 'new') return undefined
  const cats = await listCategories()
  const fa = CAT_FA_MAP.get(slug)
  return cats.find((c) => c.name === fa)?.id
}

const ProductCarousel: FC<ProductCarouselProps> = ({
  kicker,
  title,
  link,
  sectionId,
  catSlug,
  band = false,
  subHeader,
  headerSize = 'lg',
}) => {
  const addItem = useCartStore((s) => s.addItem)
  const hydrated = useHydrated()
  // Client-fetched fallback, used only when SSR didn't inject this carousel's products.
  const [fetchedProducts, setFetchedProducts] = useState<Product[] | null>(null)
  const [fetching, setFetching] = useState(true)

  // Reading window.__HOME_INITIAL__ only after `hydrated` flips keeps the first client
  // render identical to SSR (no window there), avoiding a hydration mismatch (React #418).
  const injected = hydrated ? readHomeInitial()?.carousels?.[sectionId] : undefined

  // Rails only merchandise what can be bought. The filter also covers a server payload
  // cached before it carried stock_count (those rows have no count and pass through).
  const products = useMemo<Product[]>(() => {
    if (fetchedProducts) return fetchedProducts
    if (injected?.length)
      return injected
        .map((p) => adaptProduct(p as ApiProduct))
        .filter((p) => !isSoldOut(p))
        .slice(0, RAIL_SIZE)
    return []
  }, [fetchedProducts, injected])

  const loading = !hydrated || (!injected?.length && fetching)

  const { trackRef, canPrev, canNext, scroll, ratio, progress } = useCarousel(products.length)

  useEffect(() => {
    if (readHomeInitial()?.carousels?.[sectionId]?.length) return
    let cancelled = false
    const load = async () => {
      try {
        const categoryId = catSlug ? await resolveCategoryId(catSlug) : undefined
        const { items } = await listProducts({ categoryId, limit: RAIL_FETCH })
        if (!cancelled)
          setFetchedProducts(
            items
              .map((p) => adaptProduct(p))
              .filter((p) => !isSoldOut(p))
              .slice(0, RAIL_SIZE),
          )
      } catch {
        if (!cancelled) setFetchedProducts([])
      } finally {
        if (!cancelled) setFetching(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [sectionId, catSlug])

  const showEmpty = !loading && products.length === 0

  return (
    <section
      className={`${band ? 'section-band ' : ''}${showEmpty ? '' : 'cv-auto'}`}
      id={sectionId}
    >
      <div className="page-section">
        <SectionHeader
          size={headerSize}
          kicker={kicker}
          title={title}
          aside={
            <>
              <ViewAllLink href={link}>مشاهده‌ی همه</ViewAllLink>
              <CarouselArrows
                canPrev={canPrev}
                canNext={canNext}
                onScroll={scroll}
                prevLabel="محصول قبلی"
                nextLabel="محصول بعدی"
              />
            </>
          }
        />
        {subHeader}
        {showEmpty ? (
          <p className="text-muted text-sm text-center py-12">
            هنوز محصولی در این بخش ثبت نشده است.
          </p>
        ) : (
          <div
            ref={trackRef}
            className="flex gap-3.5 sm:gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 -mx-[var(--pad)] px-[var(--pad)] scroll-px-[var(--pad)] [direction:rtl]"
          >
            {loading
              ? SKELETONS
              : products.map((product, i) => (
                  <div
                    key={product.id}
                    className="snap-start flex-shrink-0"
                    style={{ width: CARD_W }}
                  >
                    <ProductCard product={product} onAdd={addItem} priority={i < 2} />
                  </div>
                ))}
          </div>
        )}
        {/* Touch screens have no arrows: a thin line shows how much of the rail is left. */}
        {!loading && !showEmpty && ratio < 1 && (
          <div
            className="md:hidden mt-3 h-0.5 rounded-full bg-rule overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-ink-2 transition-[margin] duration-150"
              style={{
                width: `${ratio * 100}%`,
                marginInlineStart: `${progress * (1 - ratio) * 100}%`,
              }}
            />
          </div>
        )}
      </div>
    </section>
  )
}

export default memo(ProductCarousel)
