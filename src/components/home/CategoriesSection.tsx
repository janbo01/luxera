import { useEffect, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../data/categories'
import SectionHeader from '../shared/SectionHeader'
import { listCategories, type ApiCategory } from '../../api/product'
import { BTN_GHOST_CLS } from '../ui/Button'
import Icon from '../icons/Icon'

const CAT_STYLE: Record<string, { bg: string; text?: string; numColor?: string }> = {
  necklaces: { bg: 'bg-[linear-gradient(160deg,var(--color-copper),#8C6825)]' },
  bracelets: { bg: 'bg-[linear-gradient(160deg,#1F1318,#0d0709)]' },
  rings:     { bg: 'bg-[linear-gradient(160deg,var(--color-bg-2),#C7B28A)]', text: 'text-ink', numColor: 'text-ink-2' },
  earrings:  { bg: 'bg-[linear-gradient(160deg,var(--color-plum),var(--color-plum-2))]' },
  sets:      { bg: 'bg-[linear-gradient(160deg,#52332b,#2c1812)]' },
}

const CategoriesSection: FC = () => {
  const [apiCats, setApiCats] = useState<ApiCategory[]>([])

  useEffect(() => {
    listCategories().then(setApiCats).catch(() => {})
  }, [])

  const apiByName = new Map(apiCats.map((c) => [c.name, c]))
  const visibleCats = CATEGORIES.filter(
    (c) => !['bridal', 'new', 'mens'].includes(c.id) && apiByName.has(c.fa),
  )

  return (
    <section className="page-section">
      <SectionHeader
        kicker="Browse by category"
        title={<>هر استایل،<br /><em>هر مناسبت</em></>}
        aside={
          <a href="/categories"
            className={`${BTN_GHOST_CLS} self-end`}
          >
            همه‌ی دسته‌بندی‌ها
            <span className="inline-block w-4 h-4 transition-transform duration-200"><Icon name="arrow-left" size={16} /></span>
          </a>
        }
      />

      <div className="grid grid-cols-5 max-lg:grid-cols-3 max-md:grid-cols-2 gap-3.5">
        {visibleCats.map((cat) => {
          const apiCat = apiByName.get(cat.fa)
          const imgSrc = apiCat?.image_url
          const style = CAT_STYLE[cat.id] ?? { bg: 'bg-plum' }

          return (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`relative rounded-[14px] overflow-hidden aspect-[4/5] flex flex-col justify-end p-5 text-white isolate card-lift cursor-pointer focus-visible:outline-2 focus-visible:outline-plum focus-visible:outline-offset-2 before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(180deg,rgba(0,0,0,0)_40%,rgba(0,0,0,0.55)_100%)] ${style.bg} ${style.text ?? ''}`}
            >
              {/* Category number */}
              <span className={`font-mono text-[10px] tracking-[0.22em] absolute top-[18px] end-[18px] z-[2] ${style.numColor ?? 'text-white/65'}`}>
                {cat.num}
              </span>

              {/* Arrow button */}
              <span className="absolute top-3.5 start-3.5 w-[34px] h-[34px] rounded-full bg-white/[0.14] backdrop-blur-[8px] grid place-items-center text-white transition-all duration-200 z-[2] hover:bg-white hover:text-ink group-hover:bg-white group-hover:text-ink [&>svg]:w-3.5 [&>svg]:h-3.5">
                <Icon name="arrow-left" size={16} />
              </span>

              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={cat.fa}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-[2] transition-transform duration-500 ease-in-out hover:scale-[1.04]"
                  aria-hidden="true"
                  width="400"
                  height="500"
                />
              )}

              <div className="font-heading text-[22px] font-semibold leading-[1.2] relative z-[2]">
                {cat.fa}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default CategoriesSection
