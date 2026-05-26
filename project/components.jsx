/* ============================================================
   Luxera — components.jsx
   Header, Hero, Categories, ProductCard, Feature, Split, Story, Footer
============================================================ */

const { useState, useEffect, useRef } = React;

// ============================================================
// AnnouncementBar
// ============================================================
function AnnouncementBar() {
  const items = [
  'ارسال رایگان به سراسر ایران برای سفارش‌های بالای ۲٫۰۰۰٫۰۰۰ تومان',
  'گارانتی اصالت و پلاک تا ۳۰ سال',
  'بسته‌بندی هدیه با طراحی اختصاصی',
  'پرداخت اقساطی تا ۶ ماه از طریق درگاه ایمن'];

  return (
    <div className="announce">
      <div className="announce__track">
        {items.map((t, i) =>
        <React.Fragment key={i}>
            <span>{t}</span>
            {i < items.length - 1 && <span className="announce__dot"></span>}
          </React.Fragment>
        )}
      </div>
    </div>);

}

// ============================================================
// Header
// ============================================================
function Header({ cartCount, onCartOpen }) {
  return (
    <header className="header">
      <div className="header__top">
        <div className="header__utils">
          <button><Icon name="globe" size={14} /><span>FA</span></button>
          <button><span>پشتیبانی</span></button>
          <button><span>شعب</span></button>
        </div>
        <div className="header__brand anim-in delay-1">
          Luxera
          <span className="header__brand-fa">لوکسرا</span>
        </div>
        <div className="header__actions" style={{ gap: "21px", justifyContent: "flex-end" }}>
          <button><Icon name="search" size={16} /><span>جستجو</span></button>
          <button><Icon name="user" size={16} /><span>حساب</span></button>
          <button><Icon name="heart" size={16} /></button>
          <button onClick={onCartOpen} aria-label="سبد خرید">
            <Icon name="bag" size={16} />
            <span>سبد</span>
            {cartCount > 0 && <span className="header__cart-count">{toFa(cartCount)}</span>}
          </button>
        </div>
      </div>
      <nav className="header__nav">
        <a href="#new" className="is-accent">کالکشن جدید</a>
        <a href="#necklaces">گردنبند</a>
        <a href="#bracelets">دستبند</a>
        <a href="#rings">انگشتر</a>
        <a href="#earrings">گوشواره</a>
        <a href="#sets">ست</a>
        <a href="#bridal">عروس</a>
        <a href="#world">جهان لوکسرا</a>
        <a href="#stores">فروشگاه‌ها</a>
      </nav>
    </header>);

}

// ============================================================
// HeroSlider — auto-rotating jewelry showcase
// ============================================================
const HERO_SLIDES = [
  { tone: 'plum',    illus: 'NecklaceB', tag: 'N°۰۱ — Mahtab',   caption: 'گردنبند آوای مهتاب' },
  { tone: 'sand',    illus: 'RingA',     tag: 'N°۰۲ — Satin',    caption: 'انگشتر ساتن' },
  { tone: 'sage',    illus: 'EarringB',  tag: 'N°۰۳ — Mina',     caption: 'گوشواره میناکار' },
  { tone: 'saffron', illus: 'BraceletB', tag: 'N°۰۴ — Parsian',  caption: 'دستبند شب پارسی' },
  { tone: 'teal',    illus: 'NecklaceD', tag: 'N°۰۵ — Zar',      caption: 'گردنبند زر و گوهر' },
];

function HeroSlider() {
  const [idx, setIdx] = React.useState(0);
  const total = HERO_SLIDES.length;

  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % total), 5500);
    return () => clearInterval(t);
  }, [total]);

  const go = (n) => setIdx((n + total) % total);

  return (
    <div className="hero-slider">
      {HERO_SLIDES.map((s, i) => {
        const Comp = window[s.illus];
        return (
          <div key={i} className={`hero-slide hero-slide--${s.tone} ${i === idx ? 'is-active' : ''}`}>
            <span className="hero-slide__tag">{s.tag}</span>
            <div className="hero-slide__art"><div><Comp /></div></div>
            <span className="hero-slide__caption">{s.caption}</span>
          </div>
        );
      })}
      <span className="hero-slider__count">
        {toFa(String(idx + 1).padStart(2, '0'))} / {toFa(String(total).padStart(2, '0'))}
      </span>
      <div className="hero-slider__nav">
        {HERO_SLIDES.map((_, i) => (
          <button key={i}
            className={`hero-slider__dot ${i === idx ? 'is-active' : ''}`}
            onClick={() => go(i)}
            aria-label={`اسلاید ${i + 1}`} />
        ))}
      </div>
      <div className="hero-slider__arrows">
        <button className="hero-slider__arrow" onClick={() => go(idx - 1)} aria-label="قبل">
          <Icon name="arrow" size={14} />
        </button>
        <button className="hero-slider__arrow" onClick={() => go(idx + 1)} aria-label="بعد">
          <span style={{transform:'scaleX(-1)', display:'inline-flex'}}><Icon name="arrow" size={14} /></span>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Hero
// ============================================================
function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__text">
          <div>
            <div className="hero__eyebrow anim-in delay-1">
              <span>کالکشن بهار ۱۴۰۵</span>
              <span>·</span>
              <span>Édition Printemps</span>
            </div>
            <h1 className="hero__title anim-in delay-2">
              زیبایی، در سکوت می‌درخشد.
              <em>The Quiet Brilliance.</em>
            </h1>
            <p className="hero__lede anim-in delay-3">
              مجموعه‌ای از قطعات دست‌ساز با الهام از معماری ایرانی و خطوط
              مدرن اروپایی. هر قطعه با طلای ۱۸ عیار و سنگ‌های انتخابی،
              در کارگاه تهران ساخته شده است.
            </p>
          </div>
          <div>
            <div className="hero__cta-row anim-in delay-4">
              <button className="btn">
                مشاهده‌ی کالکشن
                <span className="arr"><Icon name="arrow" size={14} /></span>
              </button>
              <button className="btn btn--ghost">داستان لوکسرا</button>
            </div>
            <div className="hero__meta anim-in delay-5">
              <div className="hero__meta-item">
                <strong>۲۴</strong>
                <span>قطعه‌ی محدود</span>
              </div>
              <div className="hero__meta-item">
                <strong>۱۸K</strong>
                <span>طلای خالص</span>
              </div>
              <div className="hero__meta-item">
                <strong>۱۴۰۵</strong>
                <span>تولیدِ سال</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero__visual anim-in delay-2">
          <HeroSlider />
        </div>
      </div>
    </section>);

}

// ============================================================
// Categories
// ============================================================
function CategoriesSection() {
  return (
    <section className="section">
      <div className="section__head">
        <div>
          <span className="section__kicker">CATÉGORIES · ۰۶ گروه</span>
          <h2 className="section__title">
            گنجینه‌ای برای هر <em>لحظه</em>
          </h2>
        </div>
        <p className="section__lede">
          از قطعات روزمره‌ی ظریف تا جواهرات مراسم، هر مجموعه با دقت
          و حوصله طراحی شده است.
        </p>
      </div>
      <div className="cats">
        {CATEGORIES.map((c) => {
          const Comp = window[c.illus];
          return (
            <a key={c.id} href={`#${c.id}`} className="cat">
              <span className="cat__num">{c.num}</span>
              <div className="cat__svg" style={{ color: 'var(--ink-soft)' }}>
                <Comp />
              </div>
              <div className="cat__name">
                {c.fa}
                <span className="cat__name-en">{c.en}</span>
              </div>
            </a>);

        })}
      </div>
    </section>);

}

Object.assign(window, { AnnouncementBar, Header, Hero, CategoriesSection });