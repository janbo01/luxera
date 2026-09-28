import { useEffect, useState, useMemo, memo, type FC } from 'react'

import { CATEGORIES } from '../../data/categories'
import SectionHeader from '../shared/SectionHeader'
import { listCategories, type ApiCategory } from '../../api/product'
import { useHydrated } from '../../hooks/useHydrated'
import ViewAllLink from '../shared/ViewAllLink'
import Icon from '../icons/Icon'
import { readHomeInitial } from './homeInitial'
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
  const hydrated = useHydrated()
  const [fetchedCats, setFetchedCats] = useState<ApiCategory[] | null>(null)

  // Gated on `hydrated` so the first client render matches SSR (no window there),
  // avoiding a hydration mismatch (React #418).
  const injected = hydrated ? readHomeInitial()?.categories : undefined

  const apiCats = useMemo<ApiCategory[]>(() => {
    if (fetchedCats) return fetchedCats
    if (injected?.length) return injected as ApiCategory[]
    return []
  }, [fetchedCats, injected])

  useEffect(() => {
    if (readHomeInitial()?.categories?.length) return
    listCategories()
      .then(setFetchedCats)
      .catch(() => {})
  }, [])

  const apiByName = useMemo(() => new Map(apiCats.map((c) => [c.name, c])), [apiCats])

  return (
    <section className="page-section cv-auto">
      <SectionHeader
        kicker="Browse by category"
        title={
          <>
            دسته‌بندی <em>محصولات</em>
          </>
        }
        aside={<ViewAllLink href="/collections">مشاهده‌ی همه</ViewAllLink>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3.5">
        {VISIBLE_CATS.map((cat, index) => {
          const apiCat = apiByName.get(cat.fa)
          const imgSrc = apiCat?.image_url
          const bg = CAT_BG[cat.id] ?? 'bg-plum'
          const isFeatured = index === 0

          return (
            <a
              key={cat.id}
              href={`/category/${cat.id}`}
              className={`group relative rounded-[var(--radius)] overflow-hidden flex flex-col justify-end isolate card-lift cursor-pointer focus-visible:outline-2 focus-visible:outline-plum focus-visible:outline-offset-2 ${bg} ${isFeatured ? 'col-span-2 aspect-[16/10] md:row-span-2 md:aspect-auto' : 'aspect-square'}`}
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
                      ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1480px) 46vw, 680px'
                      : '(max-width: 767px) calc(50vw - 26px), (max-width: 1480px) 23vw, 336px',
                  })}
                  alt={cat.fa}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-500 ease-in-out group-hover:scale-[1.06]"
                  width={isFeatured ? 680 : 336}
                  height={isFeatured ? 680 : 336}
                />
              ) : null}

              {/* Bottom scrim — neutral black so white labels stay legible on any photo */}
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.62)_0%,rgb(0_0_0/0.08)_45%,transparent_100%)] transition-opacity duration-300 group-hover:opacity-90" />

              {/* Index number — top end corner */}
              <span className="absolute top-4 end-4 z-[2] font-mono text-[10px] tracking-[0.2em] text-white/55">
                {cat.num}
              </span>

              {/* Bottom content */}
              <div
                className={`relative z-[2] flex items-end justify-between gap-2 text-white ${isFeatured ? 'px-5 pb-5 md:px-8 md:pb-8' : 'px-4 pb-4 md:px-5 md:pb-5'}`}
              >
                <div className="min-w-0">
                  <div className="font-display italic text-[11px] tracking-[0.06em] mb-1 text-white/55">
                    {cat.en}
                  </div>
                  <div
                    className={`font-heading font-semibold leading-[1.15] ${isFeatured ? 'text-[24px] md:text-[34px]' : 'text-[18px] md:text-[21px]'}`}
                  >
                    {cat.fa}
                  </div>
                </div>

                {/* Arrow */}
                <span className="flex-shrink-0 w-9 h-9 rounded-full border border-white/35 bg-white/10 backdrop-blur-[6px] grid place-items-center text-white transition-all duration-300 group-hover:bg-white group-hover:text-ink group-hover:border-white group-hover:-translate-x-0.5">
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
