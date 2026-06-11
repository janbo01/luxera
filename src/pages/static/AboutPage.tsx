import { usePageMeta } from '../../hooks/usePageMeta'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { BTN_CLS, BTN_GHOST_CLS } from '../../components/ui/Button'

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

const ABOUT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'لوکسرا',
  url: 'https://luxera.ir',
  description:
    'فروشگاه تخصصی جواهرات فانتزی ایران — انتخاب دقیق برندهای معتبر، بدون نیکل، با ضمانت یک‌ساله',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+989128494308',
    contactType: 'customer service',
    availableLanguage: 'Persian',
  },
}

const AboutPage: FC = () => {
  usePageMeta({
    title: 'درباره لوکسرا؛ فروشگاه جواهرات فانتزی',
    description: 'داستان لوکسرا — فروشگاه تخصصی جواهرات فانتزی ایران',
    jsonLd: ABOUT_JSON_LD,
  })
  return (
    <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px]">
      {/* Hero */}
      <div className="py-[72px] pb-14 border-b border-rule mb-16 max-[640px]:pt-12 max-[640px]:pb-10 max-[640px]:mb-10">
        <span className="font-body text-[11px] tracking-[.2em] text-muted uppercase mb-3.5 block">
          ABOUT LUXERA
        </span>
        <h1 className="font-heading font-bold text-[clamp(40px,5vw,72px)] leading-[1.05] mt-3 mb-5 text-ink">
          درباره‌ی
          <em className="font-heading not-italic text-plum font-normal"> لوکسرا</em>
        </h1>
        <p className="max-w-[52ch] text-ink-2 text-[15px] leading-[1.85] m-0">
          لوکسرا یک فروشگاه تخصصی جواهرات فانتزی است — نه کارخانه، نه طراح، فقط یک منتخب دقیق از
          بهترین برندهای جواهرات فانتزی بازار.
        </p>
      </div>

      {/* Split */}
      <div className="grid grid-cols-[1.2fr_1fr] gap-20 items-start mb-[72px] max-[900px]:grid-cols-1 max-[900px]:gap-10">
        <div>
          <h2 className="font-heading font-bold text-[clamp(28px,3vw,44px)] m-0 mb-5 text-ink">
            چرا لوکسرا؟
          </h2>
          <p className="text-[15px] leading-[1.9] text-ink-2 m-0 mb-4">
            بازار جواهرات فانتزی ایران پر از محصولاتی است که سریع رنگ می‌دهند، پوست را حساس می‌کنند،
            یا با تصویر و توضیحاتشان فرق دارند. لوکسرا با این مشکل شروع شد.
          </p>
          <p className="text-[15px] leading-[1.9] text-ink-2 m-0 mb-4">
            هر برندی که در لوکسرا می‌فروشیم پیش از ورود به فهرست، آزمایش می‌شود. نمونه‌ها استفاده
            می‌شوند، با آب و عرق و عطر تست می‌شوند، و اگر استاندارد ما را نداشتند، نمی‌آیند.
          </p>
          <p className="text-[15px] leading-[1.9] text-ink-2 m-0 mb-4">
            نتیجه؟ یک مجموعه‌ی کوچک اما قابل اعتماد از جواهراتی که می‌توانید با خیال راحت بخرید،
            بپوشید، و هدیه بدهید.
          </p>
          <Link to="/category/new" className={`${BTN_CLS} mt-2`}>
            مشاهده‌ی محصولات
            <span className="arr">←</span>
          </Link>
        </div>
        <div className="sticky top-[120px] max-[900px]:static">
          <div className="bg-plate px-9 py-12 flex flex-col items-center gap-7">
            <div aria-hidden="true">
              <svg viewBox="0 0 200 200" fill="none" className="w-[120px] h-[120px]">
                <circle cx="100" cy="100" r="70" stroke="var(--rule)" strokeWidth="1" />
                <circle
                  cx="100"
                  cy="100"
                  r="45"
                  stroke="var(--plum)"
                  strokeWidth="0.75"
                  strokeDasharray="4 3"
                />
                <circle cx="100" cy="55" r="8" fill="var(--plum)" opacity="0.15" />
                <circle cx="100" cy="55" r="4" fill="var(--plum)" opacity="0.4" />
                <line x1="100" y1="63" x2="100" y2="145" stroke="var(--rule)" strokeWidth="0.75" />
              </svg>
            </div>
            <p className="font-body text-[18px] text-ink-2 text-center m-0 leading-[1.7]">
              «جواهر فانتزی خوب نباید تعریف پنهانی داشته باشد.»
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16 pt-14 border-t border-rule">
        <span className="font-body text-[11px] tracking-[.2em] text-muted uppercase mb-9 block">
          ارزش‌های ما
        </span>
        {VALUES.map((v) => (
          <div key={v.num} className="grid grid-cols-[56px_1fr] gap-6 py-7 border-b border-rule">
            <span className="font-body text-[11px] text-muted tracking-[.12em] pt-1">{v.num}</span>
            <div>
              <h3 className="font-body font-medium text-[17px] m-0 mb-2 text-ink">{v.title}</h3>
              <p className="text-sm leading-[1.85] text-ink-2 m-0">{v.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 border border-rule mb-16 max-[900px]:grid-cols-2 max-[640px]:grid-cols-2">
        {STATS.map((s, idx) => (
          <div
            key={s.label}
            className={`py-9 px-6 text-center border-r border-rule last:border-r-0 max-[900px]:border-b max-[900px]:border-rule ${idx % 2 === 1 ? 'max-[900px]:border-r-0' : ''}`}
          >
            <strong className="block font-heading text-[clamp(28px,3vw,40px)] text-ink mb-1.5 not-italic">
              {s.value}
            </strong>
            <span className="text-[13px] text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      {/* CTA band */}
      <div className="text-center bg-plate py-14 px-[clamp(20px,4vw,56px)] -mx-[clamp(20px,4vw,56px)] -mb-[100px] mt-16 max-[640px]:py-11">
        <h2 className="font-heading font-bold text-[clamp(28px,3vw,44px)] m-0 mb-3 text-ink">
          سوال دارید؟
        </h2>
        <p className="text-muted text-sm m-0 mb-7">
          تیم پشتیبانی لوکسرا روزانه از ساعت ۱۰ تا ۲۲ پاسخگوی شماست.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/contact" className={BTN_CLS}>
            تماس با ما <span className="arr">←</span>
          </Link>
          <Link to="/faq" className={BTN_GHOST_CLS}>
            سوالات متداول
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
