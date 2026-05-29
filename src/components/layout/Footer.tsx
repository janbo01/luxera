import { useState, useEffect, type FC } from 'react'
import { Link } from 'react-router-dom'
import { IconInstagram, IconTelegram, IconXTwitter, IconWhatsApp } from '../icons/BrandIcons'
import { listCategories } from '../../api/product'
import EnamadLogo from '../shared/EnamadLogo'
import { useInitialData } from '../../context/initialData'

declare global {
  interface Window {
    __FOOTER_INITIAL__?: {
      categories: Array<{ id: string; name: string }>
      collections: Array<{ id: string; slug: string; name_fa: string }>
    }
  }
}

type NavLink = { label: string; to: string }

function makeCatLinks(cats: Array<{ id: string; name: string }>): NavLink[] {
  return cats.slice(0, 6).map((c) => ({ label: c.name, to: `/category/${c.id}` }))
}

const STATIC_COLS = [
  {
    title: 'پشتیبانی',
    links: [
      { label: 'پیگیری سفارش', to: '/account' },
      { label: 'ارسال و تحویل', to: '/shipping' },
      { label: 'بازگشت کالا', to: '/shipping' },
      { label: 'راهنمای سایز', to: '/faq' },
      { label: 'پرسش‌های متداول', to: '/faq' },
    ],
  },
  {
    title: 'درباره‌ی ما',
    links: [
      { label: 'داستان لوکسرا', to: '/about' },
      { label: 'تماس با ما', to: '/contact' },
      { label: 'حریم خصوصی', to: '/privacy' },
      { label: 'شرایط استفاده', to: '/terms' },
    ],
  },
]

const Footer: FC = () => {
  const { footerCategories } = useInitialData()

  const [categoryLinks, setCategoryLinks] = useState<NavLink[] | null>(() => {
    if (typeof window !== 'undefined' && window.__FOOTER_INITIAL__?.categories?.length)
      return makeCatLinks(window.__FOOTER_INITIAL__.categories)
    if (footerCategories?.length) return makeCatLinks(footerCategories)
    return null
  })

  useEffect(() => {
    if (window.__FOOTER_INITIAL__) return
    listCategories().then((cats) => setCategoryLinks(makeCatLinks(cats))).catch(() => {})
  }, [])

  const col = 'flex flex-col gap-[11px]'
  const colLink = 'text-[13px] text-ink-2 transition-colors duration-200 hover:text-copper'

  return (
    <footer className="pt-[72px] pb-6 max-[720px]:pb-[calc(56px+env(safe-area-inset-bottom)+16px)] px-[var(--pad)] text-ink-2">
      <div className="grid grid-cols-[1.6fr_repeat(3,1fr)] max-lg:grid-cols-2 max-md:grid-cols-2 gap-12 max-md:gap-8 pb-12 border-b border-rule max-w-[1480px] mx-auto">

        {/* Brand column */}
        <div className="flex flex-col gap-[18px] max-w-[34ch] max-md:col-span-2">
          <span className="font-display italic text-[42px] text-ink leading-none font-normal">Luxera</span>
          <p className="text-muted text-[13px] leading-[1.7] m-0">جواهرات فانتزی، طراحی اختصاصی.</p>
          <div className="flex gap-2 mt-1">
            {[
              { icon: <IconInstagram size={14} />, label: 'اینستاگرام' },
              { icon: <IconTelegram size={14} />,  label: 'تلگرام' },
              { icon: <IconXTwitter size={14} />,  label: 'توییتر' },
              { icon: <IconWhatsApp size={14} />,  label: 'واتس‌اپ' },
            ].map(({ icon, label }) => (
              <a key={label} href="#" aria-label={label}
                className="w-9 h-9 rounded-full border border-rule grid place-items-center text-ink-2 transition-all duration-200 hover:bg-ink hover:text-bg [&>svg]:w-3.5 [&>svg]:h-3.5"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Trust badge */}
          <div className="mt-1 pt-5 border-t border-rule">
            <p className="text-[11px] text-muted tracking-[0.06em] uppercase mb-3 m-0">نماد اعتماد الکترونیکی</p>
            <div className="inline-flex items-center gap-3 rounded-xl border border-rule bg-plate/40 px-4 py-3">
              <EnamadLogo />
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-ink leading-none">لوکسرا</span>
                <span className="text-[10px] text-muted leading-none">فروشگاه معتبر</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold mb-[18px] text-ink m-0">فروشگاه</h3>
          <ul className={`list-none p-0 m-0 ${col}`}>
            {categoryLinks === null
              ? [6, 8, 5, 9, 7].map((w, i) => (
                  <li key={i}><span className="block h-[13px] rounded animate-pulse bg-plate" style={{ width: `${w}ch` }} /></li>
                ))
              : categoryLinks.map(({ label, to }) => (
                  <li key={to}><Link to={to} className={colLink}>{label}</Link></li>
                ))
            }
          </ul>
        </div>

        {STATIC_COLS.map(({ title, links }) => (
          <div key={title}>
            <h3 className="font-heading text-sm font-semibold mb-[18px] text-ink m-0">{title}</h3>
            <ul className={`list-none p-0 m-0 ${col}`}>
              {links.map(({ label, to }) => (
                <li key={label}><Link to={to} className={colLink}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pt-6 flex justify-between items-center flex-wrap gap-4 text-xs text-muted font-mono tracking-[0.04em] max-w-[1480px] mx-auto">
        <span>© ۱۴۰۴ Luxera Jewelry · Tehran</span>
        <span>طراحی و توسعه — استودیو لوکسرا</span>
      </div>
    </footer>
  )
}

export default Footer
