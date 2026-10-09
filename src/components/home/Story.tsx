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
    heading: 'پرداخت آسان با درگاه‌های معتبر؛ به‌زودی اقساط اسنپ‌پی.',
    body: 'همین حالا با درگاه‌های پرداخت امن خرید کن. در آینده‌ای نزدیک خرید اقساطی از طریق اسنپ‌پی هم فعال خواهد شد.',
  },
]

const Story: FC = () => (
  <section className="bg-ink story-section--dark cv-auto">
    <div className="max-w-[var(--maxw)] mx-auto px-[var(--pad)] py-[clamp(44px,5.5vw,80px)]">
      {/* Section kicker */}
      <div className="flex items-center gap-5">
        <span className="kicker text-gold shrink-0">Our Commitments</span>
        <div className="h-px flex-1 bg-bg/10" />
      </div>

      {/* Columns — inset to the page gutter so they line up with every other section */}
      <div className="grid grid-cols-3 max-md:grid-cols-1 mt-8 md:mt-10 rounded-[var(--radius)] ring-1 ring-inset ring-bg/10 overflow-hidden">
        {STORY_COLS.map(({ num, latinNum, title, heading, body }, i) => (
          <div
            key={num}
            data-story-num={latinNum}
            className={[
              'story-card relative overflow-hidden isolate py-11 px-9 max-lg:px-7 max-md:py-8 max-md:px-6',
              i < STORY_COLS.length - 1
                ? 'border-e border-bg/10 max-md:border-e-0 max-md:border-b'
                : '',
            ].join(' ')}
          >
            {/* Copper accent line */}
            <div className="w-7 h-px bg-gold mb-7" />

            {/* Label row */}
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-[12px] text-gold [font-feature-settings:'tnum']">{num}</span>
              <span className="text-bg/30 select-none" aria-hidden="true">
                ·
              </span>
              <span className="text-[12.5px] text-bg/75">{title}</span>
            </div>

            <h3 className="font-heading font-bold text-[19px] lg:text-[21px] leading-[1.5] m-0 mb-3.5 text-[var(--color-bg)] text-balance">
              {heading}
            </h3>
            <p className="text-[14px] text-bg/70 leading-[1.95] m-0 max-w-[46ch]">{body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default memo(Story)
