import { usePageMeta } from '../../hooks/usePageMeta'
import { useState, type FC, type FormEvent } from 'react'

const SUBJECTS = [
  'سوال درباره‌ی محصول',
  'پیگیری سفارش',
  'بازگشت و تعویض',
  'همکاری با ما',
  'سایر موارد',
]

const ContactPage: FC = () => {
  usePageMeta({ title: 'تماس با ما' })
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
    <div className="sp-page">
      <div className="sp-hero">
        <span className="section__kicker">CONTACT US</span>
        <h1 className="sp-hero__title">
          تماس با
          <em> لوکسرا</em>
        </h1>
        <p className="sp-hero__lede">
          سوال دارید؟ می‌توانید از طریق فرم زیر، واتس‌اپ، یا حضوری با ما در ارتباط باشید.
        </p>
      </div>

      <div className="contact-layout">
        {/* Info column */}
        <aside className="contact-info">
          <div className="contact-info__block">
            <h3>آدرس فروشگاه</h3>
            <p>تهران، خیابان ولیعصر،<br />بالاتر از پارک ساعی،<br />پلاک ۲۴۸۰، طبقه‌ی همکف</p>
          </div>
          <div className="contact-info__block">
            <h3>ساعت کاری</h3>
            <p>شنبه تا چهارشنبه: ۱۰ تا ۲۱<br />پنج‌شنبه: ۱۰ تا ۲۲<br />جمعه: ۱۲ تا ۲۰</p>
          </div>
          <div className="contact-info__block">
            <h3>تلفن و پیام</h3>
            <p dir="ltr" style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.06em' }}>+۹۸ ۲۱ ۸۸ ۰۰ ۰۰ ۰۰</p>
            <p style={{ marginTop: 8 }}>پشتیبانی واتس‌اپ: ۱۰ تا ۲۲ روزانه</p>
          </div>
          <div className="contact-info__block">
            <h3>شبکه‌های اجتماعی</h3>
            <div className="contact-info__socials">
              <a href="#" aria-label="اینستاگرام لوکسرا">Instagram</a>
              <a href="#" aria-label="تلگرام لوکسرا">Telegram</a>
              <a href="#" aria-label="واتس‌اپ لوکسرا">WhatsApp</a>
            </div>
          </div>

          {/* Map */}
          <div className="contact-map">
            <iframe
              title="موقعیت فروشگاه لوکسرا روی نقشه"
              src="https://www.openstreetmap.org/export/embed.html?bbox=51.39%2C35.74%2C51.42%2C35.77&layer=mapnik&marker=35.755%2C51.407"
              style={{ border: 0, width: '100%', height: '100%' }}
              loading="lazy"
              aria-label="نقشه‌ی فروشگاه لوکسرا"
            />
          </div>
        </aside>

        {/* Form column */}
        <div className="contact-form-wrap">
          {submitted ? (
            <div className="contact-success">
              <div className="contact-success__icon" aria-hidden="true">✓</div>
              <h2>پیام شما ارسال شد</h2>
              <p>تیم لوکسرا حداکثر ظرف ۲۴ ساعت پاسخ می‌دهد.</p>
              <button className="btn" onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', subject: SUBJECTS[0], message: '' }) }}>
                ارسال پیام جدید
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <h2 className="contact-form__heading">ارسال پیام</h2>

              <div className="contact-form__row">
                <div className="contact-form__field">
                  <label htmlFor="cf-name">نام و نام خانوادگی</label>
                  <input
                    id="cf-name"
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="مثلاً: نگار رضایی"
                    required
                  />
                </div>
                <div className="contact-form__field">
                  <label htmlFor="cf-phone">تلفن یا ایمیل</label>
                  <input
                    id="cf-phone"
                    type="text"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷"
                    required
                  />
                </div>
              </div>

              <div className="contact-form__field">
                <label htmlFor="cf-subject">موضوع</label>
                <select id="cf-subject" value={form.subject} onChange={set('subject')}>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="contact-form__field">
                <label htmlFor="cf-message">پیام</label>
                <textarea
                  id="cf-message"
                  value={form.message}
                  onChange={set('message')}
                  placeholder="جزئیات سوال یا درخواست خود را بنویسید..."
                  rows={6}
                  required
                />
              </div>

              <button type="submit" className="btn contact-form__submit" disabled={submitting}>
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
