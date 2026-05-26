import { usePageMeta } from '../../hooks/usePageMeta'
import type { FC } from 'react'
import { Link } from 'react-router-dom'

const VALUES = [
  {
    num: '۰۱',
    title: 'انتخاب دقیق',
    body: 'هر برند و هر قطعه‌ای که در لوکسرا می‌فروشیم از میان صدها گزینه انتخاب شده. کیفیت روکش، ایمنی پوست، و ماندگاری طرح — سه معیار اصلی ما برای انتخاب هستند.',
  },
  {
    num: '۰۲',
    title: 'بدون نیکل',
    body: 'تمام قطعات موجود در لوکسرا از آلیاژ بدون نیکل ساخته شده‌اند. اگر پوست حساس دارید یا قبلاً از زیورآلات ارزان دچار حساسیت شده‌اید، اینجا جای مطمئنی برای خرید است.',
  },
  {
    num: '۰۳',
    title: 'ضمانت واقعی',
    body: 'ضمانت یک‌ساله‌ی کیفیت یعنی اگر روکش در سال اول تغییر رنگ داد، بدون سوال قطعه را تعویض می‌کنیم. این تعهد ما به کیفیت چیزی است که ما را از بازار پر از جنس بی‌کیفیت متمایز می‌کند.',
  },
]

const STATS = [
  { value: '+۲۰۰', label: 'برند منتخب' },
  { value: '+۴,۰۰۰', label: 'قطعه‌ی موجود' },
  { value: '۹۸٪', label: 'رضایت مشتری' },
  { value: '+۱۲,۰۰۰', label: 'خرید موفق' },
]

const AboutPage: FC = () => {
  usePageMeta({ title: 'درباره‌ی ما', description: 'داستان لوکسرا — جواهرات فانتزی دست‌ساز ایرانی' })
  return (
  <div className="sp-page">
    <div className="sp-hero">
      <span className="section__kicker">ABOUT LUXERA</span>
      <h1 className="sp-hero__title">
        درباره‌ی
        <em> لوکسرا</em>
      </h1>
      <p className="sp-hero__lede">
        لوکسرا یک فروشگاه تخصصی جواهرات فانتزی است — نه کارخانه، نه طراح، فقط یک منتخب دقیق از بهترین برندهای جواهرات فانتزی بازار.
      </p>
    </div>

    <div className="about-split">
      <div className="about-split__text">
        <h2 className="about-split__heading">چرا لوکسرا؟</h2>
        <p>بازار جواهرات فانتزی ایران پر از محصولاتی است که سریع رنگ می‌دهند، پوست را حساس می‌کنند، یا با تصویر و توضیحاتشان فرق دارند. لوکسرا با این مشکل شروع شد.</p>
        <p>هر برندی که در لوکسرا می‌فروشیم پیش از ورود به فهرست، آزمایش می‌شود. نمونه‌ها استفاده می‌شوند، با آب و عرق و عطر تست می‌شوند، و اگر استاندارد ما را نداشتند، نمی‌آیند.</p>
        <p>نتیجه؟ یک مجموعه‌ی کوچک اما قابل اعتماد از جواهراتی که می‌توانید با خیال راحت بخرید، بپوشید، و هدیه بدهید.</p>
        <Link to="/category/new" className="btn" style={{ marginTop: 8, display: 'inline-flex' }}>
          مشاهده‌ی محصولات
          <span className="arr">←</span>
        </Link>
      </div>
      <div className="about-split__visual">
        <div className="about-split__plate">
          <div className="about-split__ornament" aria-hidden="true">
            <svg viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="70" stroke="var(--rule)" strokeWidth="1"/>
              <circle cx="100" cy="100" r="45" stroke="var(--plum)" strokeWidth="0.75" strokeDasharray="4 3"/>
              <circle cx="100" cy="55" r="8" fill="var(--plum)" opacity="0.15"/>
              <circle cx="100" cy="55" r="4" fill="var(--plum)" opacity="0.4"/>
              <line x1="100" y1="63" x2="100" y2="145" stroke="var(--rule)" strokeWidth="0.75"/>
            </svg>
          </div>
          <p className="about-split__quote">
            «جواهر فانتزی خوب نباید تعریف پنهانی داشته باشد.»
          </p>
        </div>
      </div>
    </div>

    <div className="about-values">
      <span className="section__kicker">ارزش‌های ما</span>
      {VALUES.map((v) => (
        <div key={v.num} className="about-value">
          <span className="about-value__num">{v.num}</span>
          <div>
            <h3 className="about-value__title">{v.title}</h3>
            <p className="about-value__body">{v.body}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="about-stats">
      {STATS.map((s) => (
        <div key={s.label} className="about-stat">
          <strong>{s.value}</strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>

    <div className="sp-cta-band">
      <h2>سوال دارید؟</h2>
      <p>تیم پشتیبانی لوکسرا روزانه از ساعت ۱۰ تا ۲۲ پاسخگوی شماست.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/contact" className="btn">تماس با ما <span className="arr">←</span></Link>
        <Link to="/faq" className="btn btn--ghost">سوالات متداول</Link>
      </div>
    </div>
  </div>
)
}

export default AboutPage
