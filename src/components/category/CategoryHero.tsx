import { type FC } from 'react'

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
}

const CategoryHero: FC<CategoryHeroProps> = ({
  category,
  catId,
  productCount,
  catProductCounts,
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

    {/* Editorial header — compact so the product grid starts above the fold */}
    <section className="mt-4 md:mt-6 relative rounded-[var(--radius-lg)] overflow-hidden isolate bg-surface ring-1 ring-inset ring-rule px-[clamp(20px,4vw,56px)] py-[clamp(24px,3.4vw,48px)] grid md:grid-cols-[1fr_auto] gap-6 md:gap-12 items-end">
      {/* Brand-tinted glow — theme tokens only */}
      <div
        aria-hidden="true"
        className="absolute -top-1/2 -end-[10%] w-[55%] aspect-square rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-plum)_14%,transparent),transparent)] -z-10 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-2/3 end-[20%] w-[45%] aspect-square rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-copper)_12%,transparent),transparent)] -z-10 pointer-events-none"
      />

      <div className="min-w-0">
        <span className="kicker mb-3 md:mb-4">{category.en}</span>
        <h1 className="font-heading font-bold text-[clamp(34px,5.4vw,72px)] leading-[1] tracking-[-0.015em] m-0 text-ink">
          {category.fa}
          {productCount > 0 && (
            <sup className="font-mono font-normal text-[clamp(11px,1.1vw,14px)] text-muted tracking-normal ms-2 align-super">
              {toFa(productCount)} محصول
            </sup>
          )}
        </h1>
        <p className="max-w-[52ch] text-[14px] md:text-[15px] leading-[1.85] text-ink-2 mt-3 md:mt-4 m-0">
          {CAT_DESC[catId] ?? ''}
        </p>
      </div>

      <ul className="flex md:flex-col gap-2 flex-wrap m-0 p-0 list-none">
        {TRUST.map((t) => (
          <li
            key={t.label}
            className="inline-flex items-center gap-2 text-[12.5px] text-ink-2 bg-bg/70 ring-1 ring-rule rounded-full ps-1.5 pe-3.5 py-1.5"
          >
            <span className="w-6 h-6 rounded-full bg-plum/10 text-plum grid place-items-center shrink-0">
              <Icon name={t.icon} size={13} strokeWidth={1.8} />
            </span>
            {t.label}
          </li>
        ))}
      </ul>
    </section>

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
