import { memo, type FC, type SyntheticEvent } from 'react'
import Icon from '../icons/Icon'

const PERKS = ['۱۰٪ تخفیفِ خرید نخست', 'دسترسی زودهنگام', 'بدون اسپم']

function handleSubmit(e: SyntheticEvent) {
  e.preventDefault()
}

const Newsletter: FC = () => (
  <section className="mt-20 px-[var(--pad)]">
    <div className="relative bg-plum text-bg rounded-[var(--radius)] overflow-hidden py-16 px-14 max-md:py-10 max-md:px-7 grid grid-cols-[1.1fr_0.9fr] max-md:grid-cols-1 gap-12 max-md:gap-8 items-center isolate before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(40%_60%_at_90%_20%,rgba(196,135,58,0.35),transparent_70%),radial-gradient(50%_70%_at_10%_90%,rgba(201,165,103,0.18),transparent_70%)]">
      <div>
        <span className="font-display italic font-normal text-sm tracking-[0.04em] text-[rgba(245,237,224,0.7)] inline-flex items-center gap-2.5 before:block before:w-[22px] before:h-px before:bg-current before:opacity-60">
          Stay in the loop
        </span>
        <h2 className="font-heading font-bold text-[clamp(30px,3vw,44px)] mt-3.5 mb-0 leading-[1.15] [&_em]:font-display [&_em]:italic [&_em]:text-[#E8C9B6] [&_em]:font-normal">
          اولین کسی باشید که <em>می‌داند</em>.
        </h2>
        <p className="mt-3.5 text-sm text-[rgba(245,237,224,0.75)] max-w-[42ch] leading-[1.7] m-0">
          هر دو هفته یک ایمیلِ کوتاه با قطعاتِ جدید، الهام‌های طراحی و پیشنهادهای ویژه — بدون اسپم.
        </p>
      </div>

      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
        <div className="flex items-center py-1.5 pe-[22px] ps-1.5 bg-[rgba(245,237,224,0.08)] border border-[rgba(245,237,224,0.18)] rounded-full backdrop-blur-[8px]">
          <input
            id="newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ایمیل شما…"
            aria-label="آدرس ایمیل"
            className="flex-1 bg-transparent border-none outline-none text-bg font-[inherit] text-sm py-2.5 text-right placeholder:text-[rgba(245,237,224,0.4)]"
          />
          <button
            type="submit"
            className="bg-bg text-ink px-6 py-3 rounded-full text-[13px] font-semibold transition-colors duration-200 cursor-pointer border-none font-[inherit] hover:bg-copper hover:text-white"
          >
            عضویت
          </button>
        </div>
        <div className="flex gap-[18px] flex-wrap text-xs text-[rgba(245,237,224,0.65)]">
          {PERKS.map((perk) => (
            <span
              key={perk}
              className="inline-flex items-center gap-1.5 [&>svg]:w-[13px] [&>svg]:h-[13px] [&>svg]:text-copper"
            >
              <Icon name="check" size={12} strokeWidth={2} /> {perk}
            </span>
          ))}
        </div>
      </form>
    </div>
  </section>
)

export default memo(Newsletter)
