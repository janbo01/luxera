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
  <section className="bg-ink story-section--dark cv-auto">
    <div className="max-w-[var(--maxw)] mx-auto">
      {/* Section kicker */}
      <div className="flex items-center gap-5 px-[var(--pad)] pt-10 pb-0">
        <span className="kicker text-gold shrink-0">Our Commitments</span>
        <div className="h-px flex-1 bg-bg/10" />
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 max-md:grid-cols-1 mt-8 border-t border-bg/10">
        {STORY_COLS.map(({ num, latinNum, title, heading, body }, i) => (
          <div
            key={num}
            data-story-num={latinNum}
            className={[
              'story-card relative overflow-hidden py-12 px-10 max-md:py-9 max-md:px-[var(--pad)]',
              i < STORY_COLS.length - 1
                ? 'border-e border-bg/10 max-md:border-e-0 max-md:border-b'
                : '',
            ].join(' ')}
          >
            {/* Copper accent line */}
            <div className="w-7 h-px bg-gold mb-8" />

            {/* Label row */}
            <div className="flex items-center gap-2.5 mb-5">
              <span className="font-mono text-[11px] text-gold tracking-[0.16em]">{num}</span>
              <span className="text-bg/30 select-none">·</span>
              <span className="text-[12px] text-bg/65">{title}</span>
            </div>

            <h3 className="font-heading font-bold text-[20px] leading-[1.4] m-0 mb-4 text-[var(--color-bg)]">
              {heading}
            </h3>
            <p className="text-[13.5px] text-bg/60 leading-[1.9] m-0">{body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default memo(Story)
