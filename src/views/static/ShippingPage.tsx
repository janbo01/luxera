import { usePageMeta } from '../../hooks/usePageMeta'
import type { FC } from 'react'
import { BTN_CLS, BTN_GHOST_CLS } from '../../components/ui/Button'
import { FREE_SHIPPING_THRESHOLD, SHIPPING } from '../../data/shipping'
import { formatToman } from '../../utils/format'
import PageHeader from '../../components/shared/PageHeader'
import Icon from '../../components/icons/Icon'

// Built from the same options checkout sells, so the two can't drift apart.
const TIMELINE = SHIPPING.map((o) => ({
  zone: o.teheranOnly ? 'تهران' : 'سراسر ایران',
  method: o.name,
  time: o.teheranOnly ? 'همان روز یا روز بعد' : o.etaLabel,
  note: `${formatToman(o.price)} · رایگان برای سفارش‌های بالای ${formatToman(FREE_SHIPPING_THRESHOLD)}`,
}))

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
      'جزئیات ارسال لوکسرا — اسنپ‌باکس در تهران همان روز یا روز بعد، تیپاکس و پست پیشتاز ۲ تا ۵ روز کاری در سایر شهرها.',
  })
  return (
    <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px]">
      <div className="-mx-[clamp(20px,4vw,56px)] mb-10 border-b border-rule">
        <PageHeader
          crumbs={[{ label: 'ارسال و بازگشت' }]}
          title="ارسال و بازگشت کالا"
          description={`ارسال رایگان برای سفارش‌های بالای ${formatToman(FREE_SHIPPING_THRESHOLD)}. بازگشت تا ۴ روز پس از دریافت.`}
        />
      </div>

      <div className="mb-16">
        {/* Delivery */}
        <section id="delivery" className="mb-14 scroll-mt-28">
          <h2 className="font-heading font-bold text-[24px] m-0 mb-4 text-ink pb-3.5 border-b border-rule">
            زمان‌بندی تحویل
          </h2>
          <p className="text-ink-2 text-sm m-0 mb-6">
            روش ارسال را در مرحله‌ی دوم خرید انتخاب می‌کنید. برای تیپاکس و پست کد رهگیری فرستاده
            می‌شود.
          </p>
          {/* Phones: one card per method; wide screens: a table. */}
          <ul className="md:hidden m-0 p-0 list-none flex flex-col gap-3">
            {TIMELINE.map((row) => (
              <li key={row.method} className="border border-rule rounded-sm bg-surface px-4 py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <strong className="text-ink text-[15px]">{row.method}</strong>
                  <span className="text-plum text-[14px] font-medium">{row.time}</span>
                </div>
                <p className="m-0 mt-1 text-[13px] text-muted">
                  {row.zone} · {row.note}
                </p>
              </li>
            ))}
          </ul>
          <div className="max-md:hidden my-5">
            <table className="w-full border-collapse font-body text-sm">
              <thead>
                <tr>
                  {['منطقه', 'روش ارسال', 'زمان تحویل', 'هزینه'].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-right font-medium text-[13px] text-ink-2 bg-plate border-b border-rule"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMELINE.map((row) => (
                  <tr key={row.method}>
                    <td className="py-3.5 px-4 border-b border-rule align-middle text-ink-2">
                      <strong>{row.zone}</strong>
                    </td>
                    <td className="py-3.5 px-4 border-b border-rule align-middle text-ink-2">
                      {row.method}
                    </td>
                    <td className="py-3.5 px-4 border-b border-rule align-middle text-[14px] text-plum font-medium whitespace-nowrap">
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
            <strong className="text-ink">هزینه‌ی ارسال:</strong> رایگان برای سفارش‌های بالای{' '}
            {formatToman(FREE_SHIPPING_THRESHOLD)}، با هر روشی که انتخاب کنید.
          </div>
        </section>

        {/* Packaging */}
        <section className="mb-14">
          <h2 className="font-heading font-bold text-[24px] m-0 mb-4 text-ink pb-3.5 border-b border-rule">
            بسته‌بندی
          </h2>
          <p className="text-ink-2 text-sm leading-[1.8]">
            هر قطعه در جعبه‌ی مخصوص لوکسرا با کیف پارچه‌ای ارسال می‌شود. اگر سفارش هدیه است، در
            مرحله‌ی ارسال «بسته‌بندی هدیه» را انتخاب کنید: جعبه‌ی مخمل و کارت دست‌نویس با متنی که
            خودتان می‌نویسید.
          </p>
        </section>

        {/* Returns */}
        <section id="returns" className="mb-14 scroll-mt-28">
          <h2 className="font-heading font-bold text-[24px] m-0 mb-4 text-ink pb-3.5 border-b border-rule">
            سیاست بازگشت
          </h2>
          <p className="text-ink-2 text-sm m-0 mb-6">
            تا ۴ روز پس از دریافت سفارش امکان بازگشت وجود دارد. پس از این مهلت مرجوعی پذیرفته
            نمی‌شود.
          </p>
          <div className="flex flex-col mt-6">
            {RETURN_STEPS.map((s) => (
              <div key={s.n} className="grid grid-cols-[48px_1fr] gap-5 py-6 border-b border-rule">
                <span className="w-9 h-9 bg-plum text-bg text-[13px] flex items-center justify-center shrink-0">
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
          <h2 className="font-heading font-bold text-[24px] m-0 mb-4 text-ink pb-3.5 border-b border-rule">
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
            تماس با ما{' '}
            <span className="arr">
              <Icon name="arrow-left" size={16} />
            </span>
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
