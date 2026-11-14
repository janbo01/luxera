import { useEffect, useState, useMemo, memo, type FC } from 'react'

import { CATEGORIES } from '../../data/categories'
import SectionHeader from '../shared/SectionHeader'
import { listCategories, type ApiCategory } from '../../api/product'
import ViewAllLink from '../shared/ViewAllLink'
import Icon from '../icons/Icon'
import { useHomeLists } from './homeInitial'
import { imgSet } from '../../utils/cdnImage'

// Fallback fills (shown only while a category has no image) — all theme tokens,
// so they follow the colours chosen in the admin panel.
const CAT_BG: Record<string, string> = {
  necklaces: 'bg-[linear-gradient(155deg,var(--color-copper)_0%,var(--color-copper-dark)_100%)]',
  bracelets: 'bg-[linear-gradient(155deg,var(--color-ink-2)_0%,var(--color-ink)_100%)]',
  rings: 'bg-[linear-gradient(155deg,var(--color-copper-2)_0%,var(--color-ink)_100%)]',
  earrings: 'bg-[linear-gradient(155deg,var(--color-plum)_0%,var(--color-plum-dark)_100%)]',
  sets: 'bg-[linear-gradient(155deg,var(--color-plum-dark)_0%,var(--color-ink)_100%)]',
}

const VISIBLE_CATS = CATEGORIES.filter((c) => !['bridal', 'new', 'mens'].includes(c.id))

const CategoriesSection: FC = () => {
  const [fetchedCats, setFetchedCats] = useState<ApiCategory[] | null>(null)

  // Server-fetched (props → context), so SSR already renders the tile photos.
  const injected = useHomeLists()?.categories
  const hasInjected = !!injected?.length

  const apiCats = useMemo<ApiCategory[]>(() => {
    if (fetchedCats) return fetchedCats
    if (injected?.length) return injected as ApiCategory[]
    return []
  }, [fetchedCats, injected])

  useEffect(() => {
    if (hasInjected) return
    listCategories()
      .then(setFetchedCats)
      .catch(() => {})
  }, [hasInjected])

  const apiByName = useMemo(() => new Map(apiCats.map((c) => [c.name, c])), [apiCats])

  return (
    <section className="page-section cv-auto">
      <SectionHeader
        kicker="خرید بر اساس دسته"
        title={
          <>
            دسته‌بندی <em>محصولات</em>
          </>
        }
        aside={<ViewAllLink href="/collections">مشاهده‌ی همه</ViewAllLink>}
      />

      {/* Phones: one swipeable row of portrait tiles (a bento there cost ~800px of scroll).
          Desktop keeps the 4-column bento with the featured tile spanning 2×2. */}
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none snap-x snap-mandatory -mx-[var(--pad)] px-[var(--pad)] scroll-px-[var(--pad)] md:grid md:grid-cols-4 md:gap-3.5 md:overflow-visible md:m-0 md:p-0">
        {VISIBLE_CATS.map((cat, index) => {
          const apiCat = apiByName.get(cat.fa)
          const imgSrc = apiCat?.image_url
          const bg = CAT_BG[cat.id] ?? 'bg-plum'
          const isFeatured = index === 0

          return (
            <a
              key={cat.id}
              href={`/category/${cat.id}`}
              className={`group relative rounded-[var(--radius)] overflow-hidden flex flex-col justify-end isolate card-lift cursor-pointer focus-visible:outline-2 focus-visible:outline-plum focus-visible:outline-offset-2 ${bg} max-md:w-[38vw] max-md:max-w-[170px] max-md:shrink-0 max-md:snap-start max-md:aspect-[3/4] ${isFeatured ? 'md:col-span-2 md:row-span-2' : 'md:aspect-square'}`}
            >
              {imgSrc ? (
                <img
                  {...imgSet(imgSrc, {
                    widths: isFeatured ? [480, 720, 960, 1280] : [240, 320, 400, 480, 640],
                    ratio: 1,
                    // Bento: featured spans 2×2 of a 4-col grid on desktop (≈ half the
                    // container, square), full width at 16:10 on mobile; small tiles are
                    // square quarters (desktop) or halves (mobile). Capped by --maxw 1480.
                    sizes: isFeatured
                      ? '(max-width: 767px) 38vw, (max-width: 1480px) 46vw, 680px'
                      : '(max-width: 767px) 38vw, (max-width: 1480px) 23vw, 336px',
                  })}
                  alt={cat.fa}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-500 ease-in-out group-hover:scale-[1.06]"
                  width={isFeatured ? 680 : 336}
                  height={isFeatured ? 680 : 336}
                />
              ) : null}

              {/* Label pill — frosted surface, so pale photos stay clean (no dark scrim) */}
              <div
                className={`relative z-[2] flex items-end justify-between gap-2 ${isFeatured ? 'p-2.5 md:p-5' : 'p-2.5 md:p-3.5'}`}
              >
                <span
                  className={`inline-flex items-center min-w-0 rounded-full bg-surface/90 backdrop-blur-[8px] text-ink shadow-[var(--shadow-soft)] font-heading font-semibold leading-[1.3] px-3.5 pt-[calc(6px+0.22em)] pb-[calc(6px-0.22em)] text-[15px] ${isFeatured ? 'md:px-5 md:pt-[calc(8px+0.22em)] md:pb-[calc(8px-0.22em)] md:text-[22px]' : 'md:text-[17px]'}`}
                >
                  {cat.fa}
                </span>

                {/* Arrow */}
                <span className="max-md:hidden flex-shrink-0 w-9 h-9 rounded-full bg-surface/90 backdrop-blur-[8px] shadow-[var(--shadow-soft)] grid place-items-center text-ink transition-all duration-300 group-hover:bg-ink group-hover:text-bg group-hover:-translate-x-0.5">
                  <Icon name="arrow-left" size={13} />
                </span>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}

export default memo(CategoriesSection)
