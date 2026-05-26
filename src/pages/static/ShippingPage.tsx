import { usePageMeta } from '../../hooks/usePageMeta'
import type { FC } from 'react'
import { Link } from 'react-router-dom'

const TIMELINE = [
  { zone: 'تهران', method: 'پیک ویژه‌ی لوکسرا', time: '۲۴ ساعت', note: 'ارسال در همان روز برای سفارش‌های قبل از ۱۴:۰۰' },
  { zone: 'کلان‌شهرها', method: 'پست پیشتاز', time: '۲ روز کاری', note: 'اصفهان، شیراز، مشهد، تبریز، اهواز' },
  { zone: 'سراسر ایران', method: 'پست پیشتاز', time: '۲ تا ۴ روز', note: 'تمام شهرهای تحت پوشش پست' },
]

const RETURN_STEPS = [
  { n: '۱', title: 'تماس با پشتیبانی', body: 'از طریق واتس‌اپ یا فرم تماس، درخواست بازگشت را ثبت کنید. کد سفارش خود را داشته باشید.' },
  { n: '۲', title: 'آماده‌سازی بسته', body: 'قطعه را با پلاک سالم، در بسته‌بندی اصلی قرار دهید. کارت شناسایی یا تصویر رسید سفارش را ضمیمه کنید.' },
  { n: '۳', title: 'ارسال', body: 'لوکسرا هزینه‌ی بازگشت را پرداخت می‌کند. پیک در آدرس شما حضور پیدا می‌کند یا کد پستی ارسال می‌شود.' },
  { n: '۴', title: 'تأیید و استرداد', body: 'پس از بررسی وضعیت کالا، ظرف ۳ تا ۵ روز کاری مبلغ به روش پرداخت اولیه برگشت داده می‌شود.' },
]

const ShippingPage: FC = () => {
  usePageMeta({ title: 'ارسال و تحویل' })
  return (
  <div className="sp-page">
    <div className="sp-hero">
      <span className="section__kicker">SHIPPING & RETURNS</span>
      <h1 className="sp-hero__title">
        ارسال و
        <em> بازگشت</em>
      </h1>
      <p className="sp-hero__lede">
        ارسال رایگان به سراسر ایران. بازگشت بدون دردسر تا ۱۴ روز.
      </p>
    </div>

    <div className="shipping-body">
      {/* Delivery */}
      <section className="sp-section">
        <h2 className="sp-section__title">زمان‌بندی تحویل</h2>
        <p className="sp-section__lede">تمام سفارش‌ها بیمه دارند و با کد رهگیری ارسال می‌شوند.</p>
        <div className="ship-table-wrap">
          <table className="ship-table">
            <thead>
              <tr>
                <th>منطقه</th>
                <th>روش ارسال</th>
                <th>زمان تحویل</th>
                <th>توضیحات</th>
              </tr>
            </thead>
            <tbody>
              {TIMELINE.map((row) => (
                <tr key={row.zone}>
                  <td><strong>{row.zone}</strong></td>
                  <td>{row.method}</td>
                  <td className="ship-table__time">{row.time}</td>
                  <td className="ship-table__note">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sp-callout">
          <strong>هزینه‌ی ارسال:</strong> رایگان برای تمام سفارش‌ها، بدون حداقل مبلغ.
        </div>
      </section>

      {/* Packaging */}
      <section className="sp-section">
        <h2 className="sp-section__title">بسته‌بندی</h2>
        <p>هر قطعه در جعبه‌ی مخصوص لوکسرا با کیف پارچه‌ای آماده می‌شود. بسته‌بندی هدیه‌ای استاندارد است و نیازی به درخواست اضافی ندارد — چه برای خودتان، چه برای هدیه دادن.</p>
      </section>

      {/* Returns */}
      <section className="sp-section">
        <h2 className="sp-section__title">سیاست بازگشت</h2>
        <p className="sp-section__lede">تا ۱۴ روز پس از دریافت سفارش، امکان بازگشت وجود دارد.</p>

        <div className="return-steps">
          {RETURN_STEPS.map((s) => (
            <div key={s.n} className="return-step">
              <span className="return-step__n">{s.n}</span>
              <div>
                <h4 className="return-step__title">{s.title}</h4>
                <p className="return-step__body">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conditions */}
      <section className="sp-section">
        <h2 className="sp-section__title">شرایط بازگشت</h2>
        <div className="sp-two-col">
          <div>
            <h4 className="sp-col-head">✓ مشمول بازگشت</h4>
            <ul className="sp-list sp-list--ok">
              <li>قطعه سالم و بدون آسیب فیزیکی</li>
              <li>پلاک اصلی دست‌نخورده</li>
              <li>در بسته‌بندی اصلی</li>
              <li>تا ۱۴ روز از تاریخ دریافت</li>
            </ul>
          </div>
          <div>
            <h4 className="sp-col-head">✗ شامل بازگشت نمی‌شود</h4>
            <ul className="sp-list sp-list--no">
              <li>قطعاتی که استفاده شده‌اند</li>
              <li>قطعاتی که پلاکشان جدا شده</li>
              <li>آسیب فیزیکی ناشی از بی‌احتیاطی</li>
              <li>محصولات سفارشی‌سازی شده</li>
            </ul>
          </div>
        </div>
      </section>
    </div>

    <div className="sp-cta-band">
      <h2>سوال دارید؟</h2>
      <p>تیم پشتیبانی لوکسرا پاسخگوست.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/contact" className="btn">تماس با ما <span className="arr">←</span></Link>
        <Link to="/faq" className="btn btn--ghost">سوالات متداول</Link>
      </div>
    </div>
  </div>
)
}

export default ShippingPage
