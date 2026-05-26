import type { FC, FormEvent } from 'react'
import Icon from '../icons/Icon'

const Newsletter: FC = () => {
  const handleSubmit = (e: FormEvent) => e.preventDefault()

  return (
    <section className="newsletter">
      <div className="newsletter__card">
        <div>
          <span className="kicker">Stay in the loop</span>
          <h3>اولین کسی باشید که <em>می‌داند</em>.</h3>
          <p>
            هر دو هفته یک ایمیلِ کوتاه با قطعاتِ جدید، الهام‌های طراحی
            و پیشنهادهای ویژه — بدون اسپم.
          </p>
        </div>
        <form className="newsletter__form" onSubmit={handleSubmit}>
          <div className="newsletter__input">
            <input type="email" placeholder="ایمیل شما…" />
            <button type="submit">عضویت</button>
          </div>
          <div className="newsletter__perks">
            <span><Icon name="check" size={12} strokeWidth={2} /> ۱۰٪ تخفیفِ خرید نخست</span>
            <span><Icon name="check" size={12} strokeWidth={2} /> دسترسی زودهنگام</span>
            <span><Icon name="check" size={12} strokeWidth={2} /> بدون اسپم</span>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Newsletter
