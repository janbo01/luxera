import { useEffect, useState, useMemo, memo, type FC } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../data/categories'
import SectionHeader from '../shared/SectionHeader'
import { listCategories, type ApiCategory } from '../../api/product'
import { BTN_GHOST_CLS } from '../ui/Button'
import Icon from '../icons/Icon'

const CAT_BG: Record<string, string> = {
  necklaces: 'bg-[linear-gradient(155deg,#a06828_0%,#6b3e10_100%)]',
  bracelets: 'bg-[linear-gradient(155deg,#1a0f10_0%,#0d0508_100%)]',
  rings:     'bg-[linear-gradient(155deg,#5c3d1e_0%,#2e1a08_100%)]',
  earrings:  'bg-[linear-gradient(155deg,var(--color-plum)_0%,var(--color-plum-dark)_100%)]',
  sets:      'bg-[linear-gradient(155deg,#4a2820_0%,#1e0e0a_100%)]',
}

const VISIBLE_CATS = CATEGORIES.filter(
  (c) => !['bridal', 'new', 'mens'].includes(c.id),
)

const CategoriesSection: FC = () => {
  const [apiCats, setApiCats] = useState<ApiCategory[]>([])

  useEffect(() => {
    listCategories().then(setApiCats).catch(() => {})
  }, [])

  const apiByName = useMemo(
    () => new Map(apiCats.map((c) => [c.name, c])),
    [apiCats],
  )

  return (
    <section className="page-section">
      <SectionHeader
        kicker="Browse by category"
        title={<>هر استایل،<br /><em>هر مناسبت</em></>}
        aside={
          <Link to="/collections" className={`${BTN_GHOST_CLS} self-end`}>
            همه‌ی دسته‌بندی‌ها
            <span className="arr"><Icon name="arrow-left" size={16} /></span>
          </Link>
        }
      />

      <div className="grid grid-cols-5 max-lg:grid-cols-3 max-md:grid-cols-2 gap-3">
        {VISIBLE_CATS.map((cat) => {
          const apiCat = apiByName.get(cat.fa)
          const imgSrc = apiCat?.image_url
          const bg = CAT_BG[cat.id] ?? 'bg-plum'

          return (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`group relative rounded-[16px] overflow-hidden aspect-[3/4] flex flex-col justify-end isolate card-lift cursor-pointer focus-visible:outline-2 focus-visible:outline-plum focus-visible:outline-offset-2 ${bg}`}
            >
              {/* Category image */}
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={cat.fa}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-[1] transition-transform duration-500 ease-in-out group-hover:scale-[1.06]"
                  aria-hidden="true"
                  width="400"
                  height="533"
                />
              ) : null}

              {/* Bottom gradient overlay */}
              <div className="absolute inset-0 -z-[0] bg-[linear-gradient(to_top,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.1)_50%,transparent_100%)]" />

              {/* Index number — top end corner */}
              <span className="absolute top-4 end-4 z-[2] font-mono text-[10px] tracking-[0.2em] text-white/55">
                {cat.num}
              </span>

              {/* Bottom content */}
              <div className="relative z-[2] flex items-end justify-between gap-2 px-5 pb-5 text-white">
                <div className="min-w-0">
                  <div className="font-display italic text-[11px] tracking-[0.06em] mb-1 text-white/55">
                    {cat.en}
                  </div>
                  <div className="font-heading text-[21px] font-semibold leading-[1.15]">
                    {cat.fa}
                  </div>
                </div>

                {/* Arrow */}
                <span className="flex-shrink-0 w-8 h-8 rounded-full border border-white/20 grid place-items-center text-white/55 transition-all duration-200 group-hover:bg-white group-hover:text-ink group-hover:border-white">
                  <Icon name="arrow-left" size={13} />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default memo(CategoriesSection)
