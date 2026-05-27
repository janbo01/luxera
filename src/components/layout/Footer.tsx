import { useState, useEffect, type FC } from 'react'
import { Link } from 'react-router-dom'
import { IconInstagram, IconTelegram, IconXTwitter, IconWhatsApp } from '../icons/BrandIcons'
import { listCategories, listCollections } from '../../api/product'

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
  const [categoryLinks, setCategoryLinks] = useState<{ label: string; to: string }[]>([])
  const [collectionLinks, setCollectionLinks] = useState<{ label: string; to: string }[]>([])

  useEffect(() => {
    listCategories()
      .then((cats) => {
        setCategoryLinks(
          cats.slice(0, 6).map((c) => ({ label: c.name, to: `/category/${c.id}` }))
        )
      })
      .catch(() => {})

    listCollections()
      .then((cols) => {
        setCollectionLinks(
          cols.slice(0, 5).map((c) => ({ label: c.name_fa, to: `/collections/${c.slug}` }))
        )
      })
      .catch(() => {})
  }, [])

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand-col">
          <span className="footer__brand">Luxera</span>
          <p className="footer__addr">
            جواهرات فانتزی، طراحی اختصاصی.
          </p>
          <div className="footer__socials">
            <a href="#" aria-label="اینستاگرام"><IconInstagram size={18} /></a>
            <a href="#" aria-label="تلگرام"><IconTelegram size={18} /></a>
            <a href="#" aria-label="توییتر"><IconXTwitter size={18} /></a>
            <a href="#" aria-label="واتس‌اپ"><IconWhatsApp size={18} /></a>
          </div>
        </div>

        {categoryLinks.length > 0 && (
          <div className="footer__col">
            <h5>فروشگاه</h5>
            <ul>
              {categoryLinks.map(({ label, to }) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>
        )}

        {collectionLinks.length > 0 && (
          <div className="footer__col">
            <h5>مجموعه‌ها</h5>
            <ul>
              {collectionLinks.map(({ label, to }) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>
        )}

        {STATIC_COLS.map(({ title, links }) => (
          <div key={title} className="footer__col">
            <h5>{title}</h5>
            <ul>
              {links.map(({ label, to }) => (
                <li key={label}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__bottom">
        <span>© ۱۴۰۴ Luxera Jewelry · Tehran</span>
        <a referrerPolicy="origin" target="_blank"
          href="https://trustseal.enamad.ir/?id=6141265&Code=qPT6vUeIooyka6VFFwT1vC3rfeuN0RHg">
          <img referrerPolicy="origin"
            src="https://trustseal.enamad.ir/logo.aspx?id=6141265&Code=qPT6vUeIooyka6VFFwT1vC3rfeuN0RHg"
            alt="نماد اعتماد الکترونیکی" style={{ cursor: 'pointer', height: '40px', width: 'auto' }}
            code="qPT6vUeIooyka6VFFwT1vC3rfeuN0RHg" />
        </a>
        <span>طراحی و توسعه — استودیو لوکسرا</span>
      </div>
    </footer>
  )
}

export default Footer
