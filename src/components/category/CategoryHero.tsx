import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../data/categories'
import { toFa } from '../../utils/format'
import type { Category } from '../../types'
import Icon from '../icons/Icon'

const CAT_DESC: Record<string, string> = {
  necklaces: 'از زنجیرهای ظریف روزمره تا گردنبندهای دست‌ساز — با روکش‌های باکیفیت و طراحی اختصاصی برای هر سبک.',
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
    <svg className="glyph" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 60 Q100 170 170 60" />
      <circle cx="100" cy="138" r="8" />
      <path d="M100 144 L92 158 L100 172 L108 158 Z" />
      <circle cx="100" cy="138" r="3" fill="currentColor" />
    </svg>
  ),
  bracelets: (
    <svg className="glyph" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round">
      <ellipse cx="100" cy="100" rx="60" ry="42" transform="rotate(-15 100 100)" />
      <circle cx="142" cy="84" r="5" />
      <circle cx="58" cy="116" r="5" />
    </svg>
  ),
  rings: (
    <svg className="glyph" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round">
      <circle cx="100" cy="110" r="52" />
      <circle cx="100" cy="110" r="36" />
      <ellipse cx="100" cy="60" rx="14" ry="10" />
      <path d="M86 67 L86 74 M114 67 L114 74" />
    </svg>
  ),
  earrings: (
    <svg className="glyph" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round">
      <circle cx="70" cy="50" r="6" />
      <path d="M70 56 L60 105 L70 132 L80 105 Z" />
      <circle cx="70" cy="132" r="8" />
      <circle cx="130" cy="50" r="6" />
      <path d="M130 56 L120 105 L130 132 L140 105 Z" />
      <circle cx="130" cy="132" r="8" />
    </svg>
  ),
  sets: (
    <svg className="glyph" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".8" strokeLinecap="round">
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
      <nav className="crumb cat-crumb">
        <Link to="/">خانه</Link>
        <span style={{ opacity: 0.5, display: 'inline-flex' }}>
          <Icon name="chevron-left" size={10} />
        </span>
        <Link to="/">فروشگاه</Link>
        <span style={{ opacity: 0.5, display: 'inline-flex' }}>
          <Icon name="chevron-left" size={10} />
        </span>
        <span className="crumb__current">{category.fa}</span>
      </nav>

      <section className="cat-hero">
        <div className="ch-left">
          <div className="num-row">
            <span className="num">دسته‌بندی · {category.num} از ۰۵</span>
            <span className="corner-tag">به‌روزرسانی شده · امروز</span>
          </div>
          <div>
            <h1 className="cat-hero__h1">
              {category.fa}
              <span className="en">{category.en}</span>
            </h1>
            <p className="desc" style={{ marginTop: 24 }}>{CAT_DESC[catId] ?? ''}</p>
          </div>
          <div className="meta-row">
            <div className="stat"><div className="v">{toFa(productCount)}</div><div className="l">محصول</div></div>
            <div className="sep" />
            <div className="stat"><div className="v">{toFa(Math.min(productCount, 12))}</div><div className="l">طرح جدید</div></div>
            <div className="sep" />
            <div className="stat"><div className="v">بی‌آلرژی</div><div className="l">متریال</div></div>
            <div className="sep" />
            <div className="stat"><div className="v">دست‌ساز</div><div className="l">تهران</div></div>
          </div>
        </div>
        <div className="ch-right">
          <div className="feature">
            {glyph}
            <span className="feat-tag">
              <span className="dot" />
              {category.fa} · نمونه‌ی ویژه
            </span>
          </div>
        </div>
      </section>

      <div className="catnav">
        <span className="lbl">سایر دسته‌بندی‌ها</span>
        {MAIN_CATS.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className={cat.id === catId ? 'active' : undefined}
          >
            {cat.fa} <span className="n">{toFa(catProductCounts[cat.id] ?? 0)}</span>
          </Link>
        ))}
      </div>
    </>
  )
}

export default CategoryHero
