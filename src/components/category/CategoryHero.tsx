import { type FC } from 'react'

import { CATEGORIES } from '../../data/categories'
import { toFa } from '../../utils/format'
import type { Category } from '../../types'
import Icon from '../icons/Icon'
import PageIntro from '../shared/PageIntro'
import { imgSet } from '../../utils/cdnImage'

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

const TRUST = [
  { icon: 'shield', label: 'بی‌آلرژی و بدون نیکل' },
  { icon: 'check', label: '۴ روز ضمانت بازگشت' },
  { icon: 'clock', label: 'ارسال یک‌روزه تهران' },
]

const MAIN_CATS = CATEGORIES.filter((c) => !['new', 'bridal', 'mens'].includes(c.id))

interface CategoryHeroProps {
  category: Category
  catId: string
  productCount: number
  catProductCounts: Record<string, number>
  /** Image URLs of the category's first products, shown as a mosaic beside the title. */
  previews?: string[]
}

const CategoryHero: FC<CategoryHeroProps> = ({
  category,
  catId,
  productCount,
  catProductCounts,
  previews = [],
}) => (
  <>
    {/* Breadcrumb */}
    <nav aria-label="مسیر صفحه" className="flex items-center gap-2 text-[12.5px] text-muted pt-5">
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

    {/* Editorial header — shared with collections/blog; compact so the grid starts above the fold */}
    <PageIntro
      kicker={category.en}
      title={category.fa}
      description={CAT_DESC[catId] ?? ''}
      meta={
        <>
          {productCount > 0 && (
            <span className="text-ink-2 font-medium">{toFa(productCount)} محصول</span>
          )}
          {TRUST.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-1.5">
              <Icon name={t.icon} size={13} strokeWidth={1.8} className="text-plum" />
              {t.label}
            </span>
          ))}
        </>
      }
      aside={
        previews.length >= 3 ? (
          <div className="hidden md:flex gap-2 w-[min(34vw,380px)]" aria-hidden>
            {previews.slice(0, 3).map((src, i) => (
              <img
                key={src}
                {...imgSet(src, { widths: [240, 480], ratio: 3 / 4, sizes: '130px' })}
                alt=""
                decoding="async"
                className={`flex-1 min-w-0 aspect-[3/4] object-cover rounded-[var(--radius)] ring-1 ring-rule bg-bg-2 ${i === 1 ? 'translate-y-4' : ''}`}
              />
            ))}
          </div>
        ) : undefined
      }
    />

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
            {count > 0 && <span className="font-mono text-[11px] opacity-60">{toFa(count)}</span>}
          </a>
        )
      })}
    </nav>
  </>
)

export default CategoryHero
