import { useState, type FC } from 'react'

import { CATEGORIES } from '../../data/categories'
import { toFa } from '../../utils/format'
import type { Category } from '../../types'
import Icon from '../icons/Icon'

const CAT_DESC: Record<string, string> = {
  necklaces:
    'از زنجیرهای ظریف روزمره تا گردنبندهای ظریف و شیک — با روکش‌های باکیفیت و طرح‌های روز برای هر سبک.',
  bracelets: 'دستبندهای ظریف و زیبا برای هر مناسبت، با متریال بی‌آلرژی و روکش ماندگار.',
  rings: 'انگشترهای طراحی‌شده با ذوق، از مینیمال تا جواهری — برای هر انگشت و هر سبک.',
  earrings: 'گوشواره‌های سبک و شیک از آویزان تا دکمه‌ای — متناسب با هر چهره و هر لباس.',
  sets: 'ست‌های هماهنگ شامل گردنبند، دستبند و گوشواره — برای هدیه‌ای بی‌نظیر.',
  new: 'جدیدترین طرح‌های فصل — همه‌ی دسته‌بندی‌ها، همه‌ی سبک‌ها، تازه‌ترین کالکشن.',
  bridal: 'جواهرات ویژه‌ی عروس — از حلقه تا تیاره، برای خاص‌ترین روز زندگی.',
  mens: 'اکسسوری مردانه با طراحی مدرن — انگشتر، دستبند و گردنبند مردانه.',
}

const MAIN_CATS = CATEGORIES.filter((c) => !['new', 'bridal', 'mens'].includes(c.id))

interface CategoryHeroProps {
  category: Category
  catId: string
  catProductCounts: Record<string, number>
}

/**
 * Compact category header: the title and a one-line description that expands (the live
 * product count sits in the toolbar below), so the first products sit high on a phone. Trust points are left to the
 * site-wide band, and product thumbnails are gone (they repeated the grid right below).
 */
const CategoryHero: FC<CategoryHeroProps> = ({ category, catId, catProductCounts }) => {
  const [expanded, setExpanded] = useState(false)
  const description = CAT_DESC[catId] ?? ''

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="مسیر صفحه" className="flex items-center gap-2 text-[13px] text-muted pt-5">
        <a href="/" className="hover:text-plum transition-colors">
          خانه
        </a>
        <Icon name="chevron-left" size={11} className="opacity-50" />
        <a href="/collections" className="hover:text-plum transition-colors">
          فروشگاه
        </a>
        <Icon name="chevron-left" size={11} className="opacity-50" />
        <span className="text-ink" aria-current="page">
          {category.fa}
        </span>
      </nav>

      <header className="mt-4 md:mt-6">
        <h2 className="font-heading font-bold text-[clamp(28px,3.4vw,44px)] leading-[1.15] m-0 text-ink">
          {category.fa}
        </h2>
        {description && (
          <div className="mt-1.5 flex items-start gap-2 max-w-[72ch]">
            <p
              id="cat-desc"
              className={`m-0 text-[14px] leading-[1.9] text-ink-2 ${expanded ? '' : 'line-clamp-1 md:line-clamp-none'}`}
            >
              {description}
            </p>
            <button
              type="button"
              className="shrink-0 min-h-[30px] text-[13px] text-muted underline underline-offset-4 cursor-pointer hover:text-ink md:hidden"
              aria-expanded={expanded}
              aria-controls="cat-desc"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? 'کمتر' : 'بیشتر'}
            </button>
          </div>
        )}
      </header>

      {/* Category nav — horizontally scrollable on mobile */}
      <nav
        aria-label="دسته‌بندی‌ها"
        className="mt-4 md:mt-5 flex gap-2 items-center pb-1 overflow-x-auto flex-nowrap scrollbar-none [margin-inline:calc(-1*var(--pad))] [padding-inline:var(--pad)] md:m-0 md:p-0 md:flex-wrap"
      >
        {MAIN_CATS.map((cat) => {
          const active = cat.id === catId
          const count = catProductCounts[cat.id] ?? 0
          return (
            <a
              key={cat.id}
              href={`/category/${cat.id}`}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex items-center gap-2 min-h-[40px] px-4 rounded-full text-[13px] border transition-all duration-200 shrink-0 ${active ? 'bg-ink text-bg border-ink' : 'border-rule bg-surface hover:border-ink'}`}
            >
              {cat.fa}
              {count > 0 && <span className="font-mono text-[12px] opacity-60">{toFa(count)}</span>}
            </a>
          )
        })}
      </nav>
    </>
  )
}

export default CategoryHero
