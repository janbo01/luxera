import { memo, type FC } from 'react'

const STORY_COLS = [
  {
    num: '۰۱',
    latinNum: '01',
    title: 'ضمانت کیفیت',
    heading: 'بازگشت کالا تا ۴ روز پس از دریافت، بدون هیچ سؤالی.',
    body: 'اگر از خریدت راضی نبودی، کافیه ظرف ۴ روز اطلاع بدی. کالا را پس می‌گیریم و مبلغ را برمی‌گردانیم.',
  },
  {
    num: '۰۲',
    latinNum: '02',
    title: 'ارسال و بسته‌بندی',
    heading: 'ارسال امن سراسری در جعبه‌ی هدیه‌ی اختصاصی لوکسرا.',
    body: 'سفارش‌های بالای ۲٫۵۰۰٫۰۰۰ تومان با ارسال رایگان. تحویل در ۲۴ ساعت در تهران و ۲ تا ۵ روز در سراسر ایران.',
  },
  {
    num: '۰۳',
    latinNum: '03',
    title: 'اقساط بدون بهره',
    heading: 'پرداخت آسان با درگاه‌های معتبر — به‌زودی اقساط اسنپ‌پی.',
    body: 'همین حالا با درگاه‌های پرداخت امن خرید کن. در آینده‌ای نزدیک خرید اقساطی از طریق اسنپ‌پی هم فعال خواهد شد.',
  },
]

const Story: FC = () => (
  <section className="mt-20 max-md:mt-12 bg-ink story-section--dark">
    <div className="max-w-[var(--maxw)] mx-auto">
      {/* Section kicker */}
      <div className="flex items-center gap-5 px-[var(--pad)] pt-10 pb-0">
        <span className="font-display italic text-copper text-[13px] tracking-[0.04em] shrink-0 flex items-center gap-2.5">
          <span className="block w-5 h-px bg-copper/50" />
          Our Commitments
        </span>
        <div className="h-px flex-1 bg-[rgba(255,251,240,0.1)]" />
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 max-md:grid-cols-1 mt-8 border-t border-[rgba(255,251,240,0.1)]">
        {STORY_COLS.map(({ num, latinNum, title, heading, body }, i) => (
          <div
            key={num}
            data-story-num={latinNum}
            className={[
              'story-card relative overflow-hidden py-12 px-10 max-md:py-9 max-md:px-[var(--pad)]',
              i < STORY_COLS.length - 1
                ? 'border-e border-[rgba(255,251,240,0.1)] max-md:border-e-0 max-md:border-b'
                : '',
            ].join(' ')}
          >
            {/* Copper accent line */}
            <div className="w-7 h-px bg-copper mb-8" />

            {/* Label row */}
            <div className="flex items-center gap-2.5 mb-5">
              <span className="font-mono text-[11px] text-copper tracking-[0.16em]">{num}</span>
              <span className="text-[rgba(255,251,240,0.3)] select-none">·</span>
              <span className="font-mono text-[10px] text-[rgba(245,237,224,0.65)] tracking-[0.12em]">
                {title}
              </span>
            </div>

            <h3 className="font-heading font-bold text-[20px] leading-[1.4] m-0 mb-4 text-[var(--color-bg)]">
              {heading}
            </h3>
            <p className="text-[13px] text-[rgba(245,237,224,0.55)] leading-[1.9] m-0">{body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default memo(Story)
