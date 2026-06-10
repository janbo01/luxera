import { usePageMeta } from '../../hooks/usePageMeta'
import { useState, type FC, type FormEvent } from 'react'
import { BTN_CLS } from '../../components/ui/Button'

const SUBJECTS = [
  'سوال درباره‌ی محصول',
  'پیگیری سفارش',
  'بازگشت و تعویض',
  'همکاری با ما',
  'سایر موارد',
]

const FIELD = 'flex flex-col gap-[7px]'
const LABEL = 'text-[12px] font-mono tracking-[.1em] text-muted uppercase'
const INPUT = 'font-body text-sm text-ink bg-surface border border-rule px-3.5 py-[11px] outline-none transition-[border-color] focus:border-ink resize-y appearance-none'

const CONTACT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'لوکسرا',
  url: 'https://luxera.ir',
  description: 'فروشگاه تخصصی جواهرات فانتزی ایران',
  telephone: '+989128494308',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+989128494308',
    contactType: 'customer service',
    availableLanguage: 'Persian',
    hoursAvailable: 'Mo-Su 10:00-22:00',
  },
}

const ContactPage: FC = () => {
  usePageMeta({ title: 'تماس با لوکسرا و پشتیبانی فروشگاه', description: 'با تیم پشتیبانی لوکسرا از طریق واتس‌اپ، تلگرام یا فرم تماس در ارتباط باشید.', jsonLd: CONTACT_JSON_LD })
  const [form, setForm] = useState({ name: '', phone: '', subject: SUBJECTS[0], message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900))
    setSubmitting(false)
    setSubmitted(true)
  }

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="max-w-[1480px] mx-auto px-[clamp(20px,4vw,56px)] pb-[100px]">
      {/* Hero */}
      <div className="pt-[72px] pb-14 border-b border-rule mb-16 max-[640px]:pt-12 max-[640px]:pb-10 max-[640px]:mb-10">
        <span className="font-body text-[11px] tracking-[.2em] text-muted uppercase mb-3.5 block">CONTACT US</span>
        <h1 className="font-heading font-bold text-[clamp(40px,5vw,72px)] leading-[1.05] mt-3 mb-5 text-ink">
          تماس با
          <em className="font-heading not-italic text-plum font-normal"> لوکسرا</em>
        </h1>
        <p className="max-w-[52ch] text-ink-2 text-[15px] leading-[1.85] m-0">
          سوال دارید؟ می‌توانید از طریق فرم زیر یا واتس‌اپ با ما در ارتباط باشید.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_1.4fr] gap-16 items-start mb-20 max-[900px]:grid-cols-1 max-[900px]:gap-12">
        {/* Info column */}
        <aside className="flex flex-col">
          <div className="py-6 border-b border-rule first:pt-0">
            <h3 className="font-mono text-[11px] tracking-[.16em] uppercase text-muted m-0 mb-2.5">تلفن و پیام</h3>
            <p dir="ltr" className="text-right font-mono text-[13px] tracking-[.06em] text-ink-2 m-0">+98 912 849 4308</p>
            <p className="text-sm leading-[1.85] text-ink-2 m-0 mt-2">پشتیبانی واتس‌اپ: ۱۰ تا ۲۲ روزانه</p>
          </div>
          <div className="py-6 border-b border-rule">
            <h3 className="font-mono text-[11px] tracking-[.16em] uppercase text-muted m-0 mb-2.5">شبکه‌های اجتماعی</h3>
            <div className="flex gap-4 flex-wrap mt-2">
              {['Instagram','Telegram','WhatsApp'].map((s) => (
                <a key={s} href="#" aria-label={`${s} لوکسرا`} className="font-mono text-[11px] tracking-[.1em] text-muted border-b border-rule pb-0.5 transition-[color,border-color] hover:text-plum hover:border-plum">{s}</a>
              ))}
            </div>
          </div>
        </aside>

        {/* Form column */}
        <div className="sticky top-[120px] max-[900px]:static">
          {submitted ? (
            <div className="flex flex-col items-center text-center py-14 px-6 gap-4 border border-rule animate-rise">
              <div className="w-14 h-14 bg-plum text-bg text-[22px] flex items-center justify-center rounded-full" aria-hidden="true">✓</div>
              <h2 className="font-body font-light text-[22px] m-0 text-ink">پیام شما ارسال شد</h2>
              <p className="text-sm text-muted m-0">تیم لوکسرا حداکثر ظرف ۲۴ ساعت پاسخ می‌دهد.</p>
              <button
                className={BTN_CLS}
                onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', subject: SUBJECTS[0], message: '' }) }}
              >
                ارسال پیام جدید
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
              <h2 className="font-heading font-bold text-[26px] text-ink m-0 mb-7">ارسال پیام</h2>

              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                <div className={FIELD}>
                  <label htmlFor="cf-name" className={LABEL}>نام و نام خانوادگی</label>
                  <input id="cf-name" type="text" value={form.name} onChange={set('name')} placeholder="مثلاً: نگار رضایی" required className={INPUT} />
                </div>
                <div className={FIELD}>
                  <label htmlFor="cf-phone" className={LABEL}>تلفن یا ایمیل</label>
                  <input id="cf-phone" type="text" value={form.phone} onChange={set('phone')} placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷" required className={INPUT} />
                </div>
              </div>

              <div className={FIELD}>
                <label htmlFor="cf-subject" className={LABEL}>موضوع</label>
                <select
                  id="cf-subject"
                  value={form.subject}
                  onChange={set('subject')}
                  className={`${INPUT} cursor-pointer bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238E667E' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")] bg-no-repeat bg-[left_14px_center] pl-9`}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className={FIELD}>
                <label htmlFor="cf-message" className={LABEL}>پیام</label>
                <textarea
                  id="cf-message"
                  value={form.message}
                  onChange={set('message')}
                  placeholder="جزئیات سوال یا درخواست خود را بنویسید..."
                  rows={6}
                  required
                  className={INPUT}
                />
              </div>

              <button
                type="submit"
                className={`${BTN_CLS} self-start max-[640px]:w-full max-[640px]:justify-center`}
                disabled={submitting}
              >
                {submitting ? 'در حال ارسال...' : 'ارسال پیام'}
                {!submitting && <span className="arr">←</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactPage
