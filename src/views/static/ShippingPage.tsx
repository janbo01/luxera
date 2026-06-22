import { usePageMeta } from '../../hooks/usePageMeta'
import type { FC } from 'react'
import { BTN_CLS, BTN_GHOST_CLS } from '../../components/ui/Button'

const TIMELINE = [
  {
    zone: 'تهران',
    method: 'پیک ویژه‌ی لوکسرا',
    time: '۲۴ ساعت',
    note: 'ارسال در همان روز برای سفارش‌های قبل از ۱۴:۰۰',
  },
  {
    zone: 'کلان‌شهرها',
    method: 'پست پیشتاز',
    time: '۲ روز کاری',
    note: 'اصفهان، شیراز، مشهد، تبریز، اهواز',
  },
  {
    zone: 'سراسر ایران',
    method: 'پست پیشتاز',
    time: '۲ تا ۴ روز',
    note: 'تمام شهرهای تحت پوشش پست',
  },
]

const RETURN_STEPS = [
  {
    n: '۱',
    title: 'تماس با پشتیبانی',
    body: 'از طریق واتس‌اپ یا فرم تماس، درخواست بازگشت را ثبت کنید. کد سفارش خود را داشته باشید.',
  },
  {
    n: '۲',
    title: 'آماده‌سازی بسته',
    body: 'قطعه را با پلاک سالم، در بسته‌بندی اصلی قرار دهید. کارت شناسایی یا تصویر رسید سفارش را ضمیمه کنید.',
  },
  {
    n: '۳',
    title: 'ارسال',
    body: 'لوکسرا هزینه‌ی بازگشت را پرداخت می‌کند. پیک در آدرس شما حضور پیدا می‌کند یا کد پستی ارسال می‌شود.',
  },
  {
    n: '۴',
    title: 'تأیید و استرداد',
    body: 'پس از بررسی وضعیت کالا، ظرف ۳ تا ۵ روز کاری مبلغ به روش پرداخت اولیه برگشت داده می‌شود.',
  },
]

const ShippingPage: FC = () => {
  usePageMeta({
    title: 'ارسال و تحویل',
    description:
      'جزئیات ارسال لوکسرا — تحویل یک‌روزه در تهران، ۲ تا ۴ روز کاری در سراسر ایران، همه سفارش‌ها بیمه‌دار.',
  })
  return (
    <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px]">
      {/* Hero */}
      <div className="pt-[72px] pb-14 border-b border-rule mb-16 max-[640px]:pt-12 max-[640px]:pb-10 max-[640px]:mb-10">
        <span className="font-body text-[11px] tracking-[.2em] text-muted uppercase mb-3.5 block">
          SHIPPING · ارسال و بازگشت
        </span>
        <h1 className="font-heading font-bold text-[clamp(40px,5vw,72px)] leading-[1.05] mt-3 mb-5 text-ink">
          ارسال و<em className="font-heading not-italic text-plum font-normal"> بازگشت</em>
        </h1>
        <p className="max-w-[52ch] text-ink-2 text-[15px] leading-[1.85] m-0">
          ارسال رایگان بالای ۲.۵ میلیون تومان. بازگشت تا ۴ روز پس از دریافت.
        </p>
      </div>

      <div className="mb-16">
        {/* Delivery */}
        <section className="mb-14">
          <h2 className="font-body font-light text-[26px] m-0 mb-4 text-ink pb-3.5 border-b border-rule">
            زمان‌بندی تحویل
          </h2>
          <p className="text-ink-2 text-sm m-0 mb-6">
            تمام سفارش‌ها بیمه دارند و با کد رهگیری ارسال می‌شوند.
          </p>
          <div className="overflow-x-auto my-5">
            <table className="w-full border-collapse font-body text-sm min-w-[560px]">
              <thead>
                <tr>
                  {['منطقه', 'روش ارسال', 'زمان تحویل', 'توضیحات'].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-right font-normal text-[11px] font-mono tracking-[.1em] text-muted bg-plate border-b border-rule"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMELINE.map((row) => (
                  <tr key={row.zone}>
                    <td className="py-3.5 px-4 border-b border-rule align-middle text-ink-2">
                      <strong>{row.zone}</strong>
                    </td>
                    <td className="py-3.5 px-4 border-b border-rule align-middle text-ink-2">
                      {row.method}
                    </td>
                    <td className="py-3.5 px-4 border-b border-rule align-middle font-mono text-[13px] text-plum font-medium whitespace-nowrap">
                      {row.time}
                    </td>
                    <td className="py-3.5 px-4 border-b border-rule align-middle text-[13px] text-muted">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-plate px-5 py-4 text-sm text-ink-2 mt-5">
            <strong className="text-ink">هزینه‌ی ارسال:</strong> رایگان برای سفارش‌های بالای ۲٫۵
            میلیون تومان. سایر سفارش‌ها مشمول هزینه‌ی ارسال جداگانه هستند.
          </div>
        </section>

        {/* Packaging */}
        <section className="mb-14">
          <h2 className="font-body font-light text-[26px] m-0 mb-4 text-ink pb-3.5 border-b border-rule">
            بسته‌بندی
          </h2>
          <p className="text-ink-2 text-sm leading-[1.8]">
            هر قطعه در جعبه‌ی مخصوص لوکسرا با کیف پارچه‌ای آماده می‌شود. بسته‌بندی هدیه‌ای استاندارد
            است و نیازی به درخواست اضافی ندارد — چه برای خودتان، چه برای هدیه دادن.
          </p>
        </section>

        {/* Returns */}
        <section className="mb-14">
          <h2 className="font-body font-light text-[26px] m-0 mb-4 text-ink pb-3.5 border-b border-rule">
            سیاست بازگشت
          </h2>
          <p className="text-ink-2 text-sm m-0 mb-6">
            تا ۴ روز پس از دریافت سفارش امکان بازگشت وجود دارد. پس از این مهلت مرجوعی پذیرفته
            نمی‌شود.
          </p>
          <div className="flex flex-col mt-6">
            {RETURN_STEPS.map((s) => (
              <div key={s.n} className="grid grid-cols-[48px_1fr] gap-5 py-6 border-b border-rule">
                <span className="w-9 h-9 bg-plum text-bg font-mono text-[12px] flex items-center justify-center shrink-0">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-body text-[15px] font-medium mt-1 mb-1.5 text-ink">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-[1.8] text-ink-2 m-0">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conditions */}
        <section className="mb-14">
          <h2 className="font-body font-light text-[26px] m-0 mb-4 text-ink pb-3.5 border-b border-rule">
            شرایط بازگشت
          </h2>
          <div className="grid grid-cols-2 gap-10 mt-6 max-[900px]:grid-cols-1 max-[900px]:gap-7">
            <div>
              <h3 className="font-body text-sm font-medium m-0 mb-3 text-ink">✓ مشمول بازگشت</h3>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-sm text-ink-2">
                {[
                  'قطعه سالم و بدون آسیب فیزیکی',
                  'پلاک اصلی دست‌نخورده',
                  'در بسته‌بندی اصلی',
                  'تا ۴ روز از تاریخ دریافت',
                ].map((t) => (
                  <li key={t} className="before:content-['✓'] before:text-plum before:ml-2">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-body text-sm font-medium m-0 mb-3 text-ink">
                ✗ شامل بازگشت نمی‌شود
              </h3>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-sm text-ink-2">
                {[
                  'قطعاتی که استفاده شده‌اند',
                  'قطعاتی که پلاکشان جدا شده',
                  'آسیب فیزیکی ناشی از بی‌احتیاطی',
                  'محصولات سفارشی‌سازی شده',
                ].map((t) => (
                  <li key={t} className="before:content-['✗'] before:text-sale before:ml-2">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* CTA band */}
      <div className="text-center bg-plate py-14 px-[clamp(20px,4vw,56px)] -mx-[clamp(20px,4vw,56px)] -mb-[100px] mt-16 max-[640px]:py-11">
        <p className="font-heading font-bold text-[clamp(28px,3vw,44px)] m-0 mb-3 text-ink">
          سوال دارید؟
        </p>
        <p className="text-muted text-sm m-0 mb-7">تیم پشتیبانی لوکسرا پاسخگوست.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="/contact" className={BTN_CLS}>
            تماس با ما <span className="arr">←</span>
          </a>
          <a href="/faq" className={BTN_GHOST_CLS}>
            سوالات متداول
          </a>
        </div>
      </div>
    </div>
  )
}

export default ShippingPage
