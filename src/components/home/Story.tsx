import type { FC } from 'react'

const STORY_COLS = [
  {
    num: '۰۱',
    latinNum: '01',
    title: 'ضمانت کیفیت',
    heading: 'هر قطعه با ضمانت یک ساله‌ی تعویض یا بازگشت وجه همراه است.',
    body: 'اگر رنگ روکش در سال اول تغییر کرد یا با مشکل کیفی روبرو شدید، بدون سؤال تعویض می‌کنیم. رضایت شما خط قرمز ماست.',
  },
  {
    num: '۰۲',
    latinNum: '02',
    title: 'ارسال و بسته‌بندی',
    heading: 'ارسال امن سراسری در جعبه‌ی هدیه‌ی اختصاصی لوکسرا.',
    body: 'سفارش‌های بالای ۵۰۰٫۰۰۰ تومان با ارسال رایگان. تحویل در ۲۴ ساعت در تهران و ۲ تا ۴ روز در سراسر ایران.',
  },
  {
    num: '۰۳',
    latinNum: '03',
    title: 'اقساط بدون بهره',
    heading: 'پرداخت تا ۶ ماه از طریق درگاه ایمن لوکسرا.',
    body: 'خرید آسان، بدون پیش‌پرداخت سنگین. از طریق کارت‌های بانکی عضو شتاب، با تأیید فوری.',
  },
]

const Story: FC = () => (
  <section className="mt-20 max-md:mt-12 border-t border-rule">
    <div className="max-w-[var(--maxw)] mx-auto">

      {/* Section kicker */}
      <div className="flex items-center gap-5 px-[var(--pad)] pt-10 pb-0">
        <span className="font-display italic text-copper-dark text-[13px] tracking-[0.04em] shrink-0 flex items-center gap-2.5">
          <span className="block w-5 h-px bg-copper-dark/50" />
          Our Commitments
        </span>
        <div className="h-px flex-1 bg-rule" />
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 max-md:grid-cols-1 mt-8 border-t border-rule">
        {STORY_COLS.map(({ num, latinNum, title, heading, body }, i) => (
          <div
            key={num}
            className={[
              'relative overflow-hidden py-12 px-10 max-md:py-9 max-md:px-[var(--pad)]',
              i < STORY_COLS.length - 1
                ? 'border-s border-rule max-md:border-s-0 max-md:border-b'
                : '',
            ].join(' ')}
          >
            {/* Ghost numeral watermark */}
            <span
              aria-hidden="true"
              className="absolute -bottom-3 end-4 font-display font-light leading-none select-none pointer-events-none text-[140px] text-plum"
              style={{ opacity: 0.055 }}
            >
              {latinNum}
            </span>

            {/* Copper accent line */}
            <div className="w-7 h-px bg-copper mb-8" />

            {/* Label row */}
            <div className="flex items-center gap-2.5 mb-5">
              <span className="font-mono text-[11px] text-copper tracking-[0.16em]">{num}</span>
              <span className="text-rule select-none">·</span>
              <span className="font-mono text-[10px] text-muted tracking-[0.12em]">{title}</span>
            </div>

            <h4 className="font-heading font-bold text-[20px] leading-[1.4] m-0 mb-4 text-ink">
              {heading}
            </h4>
            <p className="text-[13px] text-muted leading-[1.9] m-0">{body}</p>
          </div>
        ))}
      </div>

    </div>
  </section>
)

export default Story
