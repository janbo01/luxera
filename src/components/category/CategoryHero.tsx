import { Fragment, type FC } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../data/categories'
import { toFa } from '../../utils/format'
import type { Category } from '../../types'
import Icon from '../icons/Icon'

const CAT_DESC: Record<string, string> = {
  necklaces: 'از زنجیرهای ظریف روزمره تا گردنبندهای ظریف و شیک — با روکش‌های باکیفیت و طرح‌های روز برای هر سبک.',
  bracelets: 'دستبندهای ظریف و زیبا برای هر مناسبت، با متریال بی‌آلرژی و روکش ماندگار.',
  rings:     'انگشترهای طراحی‌شده با ذوق، از مینیمال تا جواهری — برای هر انگشت و هر سبک.',
  earrings:  'گوشواره‌های سبک و شیک از آویزان تا دکمه‌ای — متناسب با هر چهره و هر لباس.',
  sets:      'ست‌های هماهنگ شامل گردنبند، دستبند و گوشواره — برای هدیه‌ای بی‌نظیر.',
  new:       'جدیدترین طرح‌های فصل — همه‌ی دسته‌بندی‌ها، همه‌ی سبک‌ها، تازه‌ترین کالکشن.',
  bridal:    'جواهرات ویژه‌ی عروس — از حلقه تا تیاره، برای خاص‌ترین روز زندگی.',
  mens:      'اکسسوری مردانه با طراحی مدرن — انگشتر، دستبند و گردنبند مردانه.',
}

const CAT_GLYPHS: Record<string, React.ReactNode> = {
  necklaces: (
    <svg className="w-[78%] h-[78%] text-[rgba(245,237,224,.45)]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 60 Q100 170 170 60" />
      <circle cx="100" cy="138" r="8" />
      <path d="M100 144 L92 158 L100 172 L108 158 Z" />
      <circle cx="100" cy="138" r="3" fill="currentColor" />
    </svg>
  ),
  bracelets: (
    <svg className="w-[78%] h-[78%] text-[rgba(245,237,224,.45)]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round">
      <ellipse cx="100" cy="100" rx="60" ry="42" transform="rotate(-15 100 100)" />
      <circle cx="142" cy="84" r="5" />
      <circle cx="58" cy="116" r="5" />
    </svg>
  ),
  rings: (
    <svg className="w-[78%] h-[78%] text-[rgba(245,237,224,.45)]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round">
      <circle cx="100" cy="110" r="52" />
      <circle cx="100" cy="110" r="36" />
      <ellipse cx="100" cy="60" rx="14" ry="10" />
      <path d="M86 67 L86 74 M114 67 L114 74" />
    </svg>
  ),
  earrings: (
    <svg className="w-[78%] h-[78%] text-[rgba(245,237,224,.45)]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round">
      <circle cx="70" cy="50" r="6" />
      <path d="M70 56 L60 105 L70 132 L80 105 Z" />
      <circle cx="70" cy="132" r="8" />
      <circle cx="130" cy="50" r="6" />
      <path d="M130 56 L120 105 L130 132 L140 105 Z" />
      <circle cx="130" cy="132" r="8" />
    </svg>
  ),
  sets: (
    <svg className="w-[78%] h-[78%] text-[rgba(245,237,224,.45)]" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round">
      <path d="M55 65 Q100 145 145 65" />
      <circle cx="100" cy="133" r="7" />
      <circle cx="55" cy="95" r="9" />
      <circle cx="145" cy="95" r="9" />
    </svg>
  ),
}

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
}) => {
  const glyph = CAT_GLYPHS[catId] ?? CAT_GLYPHS.necklaces

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-[12px] tracking-[0.06em] text-muted pt-[18px]">
        <Link to="/" className="hover:text-plum transition-colors">خانه</Link>
        <span className="opacity-50 inline-flex"><Icon name="chevron-left" size={10} /></span>
        <Link to="/" className="hover:text-plum transition-colors">فروشگاه</Link>
        <span className="opacity-50 inline-flex"><Icon name="chevron-left" size={10} /></span>
        <span className="text-ink">{category.fa}</span>
      </nav>

      {/* Hero */}
      <section className="mt-5 relative rounded-[var(--radius)] overflow-hidden text-bg isolate grid [grid-template-columns:1.05fr_.95fr] min-h-[440px] max-sm:grid-cols-1 max-sm:min-h-[auto] bg-[radial-gradient(80%_100%_at_0%_100%,rgba(196,135,58,.22),transparent_60%),linear-gradient(135deg,var(--color-plum-2)_0%,var(--color-plum)_60%,var(--color-plum-dark)_100%)] after:absolute after:inset-0 after:z-0 after:pointer-events-none after:bg-[radial-gradient(rgba(245,237,224,.06)_1px,transparent_1px)] after:[background-size:22px_22px] after:[mask-image:radial-gradient(60%_60%_at_80%_30%,#000_0%,transparent_70%)]">

        {/* Main content */}
        <div className="relative z-[2] px-14 py-12 flex flex-col justify-between gap-8 max-md:px-7 max-md:py-8 max-sm:px-5 max-sm:py-6 max-sm:gap-5">
          <div className="flex items-center justify-between gap-6">
            <span className="font-mono text-[11px] tracking-[0.24em] text-[rgba(245,237,224,.55)]">
              دسته‌بندی · {category.num} از ۰۵
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-[rgba(245,237,224,.18)] rounded-full font-mono text-[10px] tracking-[0.18em] text-[#E8D5D1] before:block before:w-[5px] before:h-[5px] before:rounded-full before:bg-copper before:flex-shrink-0">
              به‌روزرسانی شده · امروز
            </span>
          </div>

          <div>
            <h1 className="font-heading font-bold text-[clamp(36px,8vw,116px)] leading-[.95] tracking-[-0.02em] m-0 text-bg">
              {category.fa}
              <span className="block font-display italic font-normal text-[clamp(13px,1.6vw,22px)] tracking-[0.04em] text-[#E8C9B6] mt-3 leading-none">{category.en}</span>
            </h1>
            <p className="max-w-[48ch] text-[15px] leading-[1.85] text-[rgba(245,237,224,.75)] mt-6 m-0 font-body max-sm:text-[13.5px] max-sm:leading-[1.75] max-sm:mt-4">{CAT_DESC[catId] ?? ''}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-[18px] flex-wrap pt-6 border-t border-[rgba(245,237,224,.14)] max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:pt-4 max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden">
            {[
              { v: toFa(productCount), l: 'محصول' },
              { v: toFa(Math.min(productCount, 12)), l: 'طرح جدید' },
              { v: 'بی‌آلرژی', l: 'متریال' },
              { v: 'تضمین', l: 'کیفیت' },
            ].map(({ v, l }, i) => (
              <Fragment key={i}>
                {i > 0 && <div className="w-px h-7 bg-[rgba(245,237,224,.18)] flex-shrink-0 max-sm:hidden" aria-hidden="true" />}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <div className="font-heading text-[22px] font-bold text-bg leading-none">{v}</div>
                  <div className="text-[11px] text-[rgba(245,237,224,.55)] font-mono tracking-[0.08em] uppercase">{l}</div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Glyph — hidden on small mobile to save space */}
        <div className="relative z-[2] grid place-items-center p-10 max-md:min-h-[280px] max-sm:hidden">
          <div className="relative w-full max-w-[380px] aspect-square grid place-items-center before:absolute before:inset-[8%] before:border before:border-dashed before:border-[rgba(245,237,224,.22)] before:rounded-full before:animate-[cat-spin_80s_linear_infinite] after:absolute after:inset-[-2%] after:rounded-full after:bg-[radial-gradient(60%_60%_at_50%_60%,rgba(196,135,58,.35),transparent_70%)] after:blur-[20px] after:-z-[1]">
            {glyph}
            <span className="absolute bottom-[34px] left-1/2 -translate-x-1/2 inline-flex items-center gap-2.5 px-[18px] py-2.5 bg-[rgba(245,237,224,.08)] border border-[rgba(245,237,224,.18)] backdrop-blur-[10px] rounded-full text-[12px] font-mono tracking-[0.06em] text-[#E8D5D1] z-[3] whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-copper flex-shrink-0" />
              {category.fa} · نمونه‌ی ویژه
            </span>
          </div>
        </div>
      </section>

      {/* Category nav — horizontally scrollable on mobile */}
      <div className="mt-[18px] flex gap-2 items-center pb-2 max-md:pb-4 max-md:border-b max-md:border-rule max-md:mb-2 max-sm:overflow-x-auto max-sm:flex-nowrap max-sm:[margin-inline:calc(-1*var(--pad))] max-sm:[padding-inline:var(--pad)] max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden">
        <span className="font-mono text-[11px] text-muted tracking-[0.14em] uppercase me-1.5 shrink-0">سایر دسته‌بندی‌ها</span>
        {MAIN_CATS.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className={`inline-flex items-center gap-2 px-4 py-[9px] rounded-full text-[13px] border transition-all duration-200 shrink-0 ${cat.id === catId ? 'bg-ink text-bg border-ink' : 'border-rule hover:border-ink'}`}
          >
            {cat.fa}
            <span className="font-mono text-[11px] opacity-60">{toFa(catProductCounts[cat.id] ?? 0)}</span>
          </Link>
        ))}
      </div>
    </>
  )
}

export default CategoryHero
