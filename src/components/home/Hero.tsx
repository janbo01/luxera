import { useState, memo, type FC } from 'react'

import HeroSlider, { type SlideInfo, getFirstSlideInfo } from './HeroSlider'
import Icon from '../icons/Icon'
import { BTN_CLS, BTN_GHOST_CLS } from '../ui/Button'
import { formatNumber } from '../../utils/format'

const TICKER_ITEMS = [
  'جواهرات فانتزی',
  'بی‌آلرژی',
  'روکش ماندگار',
  'برندهای معتبر',
  'ارسال سریع',
  'گارانتی اصالت',
  'طراحی‌های روز',
]

const TICKER_ROW = TICKER_ITEMS.map((item) => (
  <span key={item} className="inline-flex items-center gap-2.5">
    <i className="text-copper text-sm not-italic">✦</i> {item}
  </span>
))

const HERO_STATS = [
  { v: '۴', u: 'روز', l: 'ضمانت بازگشت' },
  { v: 'رایگان', u: '', l: 'ارسال بالای ۲.۵ میلیون' },
  { v: '۲۰۰+', u: 'مدل', l: 'محصول موجود' },
] as const

const STATS_JSX = HERO_STATS.map(({ v, u, l }, i) => (
  <div key={l} className={i < HERO_STATS.length - 1 ? 'pe-4 border-e border-rule me-4' : ''}>
    <div className="font-heading text-[20px] font-bold text-ink leading-none flex items-baseline gap-1">
      {v}
      {u ? <small className="text-[11px] font-medium text-copper-dark font-body">{u}</small> : null}
    </div>
    <div className="text-[11px] text-muted mt-1.5 leading-[1.4]">{l}</div>
  </div>
))

function fmtPrice(raw?: string): string {
  const n = Number(raw)
  return raw && !isNaN(n) ? formatNumber(n) : (raw ?? '')
}

const Hero: FC = () => {
  // Pre-populate the overlay with the first slide's info so the initial
  // client render agrees with window.__BANNERS_INITIAL__ — avoids a
  // repaint-driven layout shift when the name appears after useLayoutEffect.
  const [slide, setSlide] = useState<SlideInfo>(() => getFirstSlideInfo())

  return (
    <section className="pt-4 md:pt-7">
      <div className="max-w-[1480px] mx-auto px-[var(--pad)] grid grid-cols-[1.2fr_0.8fr] max-md:grid-cols-1 gap-3 md:gap-4 items-stretch min-h-[580px] max-md:min-h-0">
        {/* ── Dark stage (left) ── */}
        <div className="relative overflow-hidden rounded-[var(--radius)] bg-[radial-gradient(120%_80%_at_80%_20%,var(--color-plum-dark)_0%,var(--color-plum)_50%,var(--color-plum-2)_100%)] text-bg isolate before:absolute before:inset-x-[-20%] before:bottom-[-40%] before:h-[60%] before:bg-[radial-gradient(50%_60%_at_50%_50%,color-mix(in_srgb,var(--color-copper)_25%,transparent),transparent_70%)] before:blur-[20px] before:-z-0 before:pointer-events-none min-h-[340px] max-md:min-h-0 max-md:aspect-square">
          <div className="absolute inset-0 z-[1]">
            <HeroSlider onSlide={setSlide} />
          </div>

          {/* Overlay meta at bottom */}
          <div className="absolute bottom-0 inset-x-0 z-[3] flex justify-between items-end gap-5 px-5 md:px-8 pt-16 pb-[72px] md:pb-[76px] bg-[linear-gradient(to_top,rgb(0_0_0/0.6)_0%,rgb(0_0_0/0.15)_60%,transparent_100%)] pointer-events-none">
            <div className="min-w-0">
              <div className="font-display italic text-[12px] tracking-[0.08em] text-white/70 mb-1">
                Featured
              </div>
              <div className="font-heading text-lg md:text-[22px] font-semibold text-white leading-tight">
                {slide.name}
              </div>
            </div>
            {slide.price ? (
              <div className="flex flex-col items-end gap-0.5">
                {slide.oldPrice ? (
                  <span className="text-[11px] line-through text-white/50 font-mono">
                    {fmtPrice(slide.oldPrice)}
                  </span>
                ) : null}
                <span className="font-heading text-xl md:text-2xl font-bold text-white whitespace-nowrap">
                  {fmtPrice(slide.price)}
                  <small className="font-body text-[11px] font-normal text-white/65 me-1">
                    {' '}
                    تومان
                  </small>
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Cream copy panel (right) ── */}
        <div className="relative overflow-hidden rounded-[var(--radius)] bg-surface ring-1 ring-inset ring-rule px-[clamp(24px,3.4vw,52px)] py-[clamp(28px,3.4vw,52px)] flex flex-col justify-center isolate">
          {/* Soft brand-tinted glow in the corner — derived from theme tokens */}
          <div
            aria-hidden="true"
            className="absolute -top-1/3 -start-1/4 w-[80%] aspect-square rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-copper)_12%,transparent),transparent)] -z-10 pointer-events-none"
          />

          <span className="inline-flex items-center gap-2 mb-4 md:mb-6 animate-rise [animation-delay:80ms]">
            <span className="w-5 h-px bg-copper-dark opacity-70" />
            <span className="font-display italic font-normal text-sm tracking-[0.04em] text-copper-dark">
              New Arrivals · پاییز ۱۴۰۴
            </span>
          </span>

          <h1 className="font-heading font-bold text-[clamp(32px,4.2vw,60px)] leading-[1.08] tracking-[-0.01em] m-0 mb-4 md:mb-6 text-ink animate-rise [animation-delay:160ms]">
            استایلِ امروز،
            <br />
            <span className="text-copper-dark relative inline-block after:absolute after:inset-x-0 after:bottom-1 after:h-2.5 after:bg-copper/[0.18] after:-z-10 after:rounded-sm">
              قیمتِ واقعی
            </span>
            .
          </h1>

          <p className="text-ink-2 text-[14.5px] md:text-[15.5px] leading-[1.9] font-light max-w-[40ch] m-0 mb-7 md:mb-9 animate-rise [animation-delay:260ms]">
            جواهرات فانتزی و اکسسوری مد از بهترین برندها — گردنبند، دستبند، انگشتر و گوشواره برای هر
            سبک و هر مناسبت. کیفیت خوب، بدون پرداخت هزینه‌ی گزاف.
          </p>

          <div className="flex gap-2.5 flex-wrap animate-rise [animation-delay:380ms] max-sm:[&>a]:flex-1 max-sm:[&>a]:justify-center max-sm:[&>a]:px-4 max-sm:[&>a]:whitespace-nowrap max-sm:[&>a]:text-[13px]">
            <a href="/category/new" className={BTN_CLS}>
              مشاهده‌ی محصولات
              <span className="arr">
                <Icon name="arrow-left" size={16} />
              </span>
            </a>
            <a href="/about" className={BTN_GHOST_CLS}>
              بیشتر بدانید
              <span className="sr-only"> درباره‌ی لوکسرا</span>
            </a>
          </div>

          <div className="mt-8 md:mt-12 pt-5 md:pt-6 border-t border-rule grid grid-cols-3 animate-rise [animation-delay:520ms]">
            {STATS_JSX}
          </div>
        </div>
      </div>

      {/* ── Ticker ── */}
      <div className="max-w-[1480px] mx-auto px-[var(--pad)] mt-3 md:mt-4 border-t border-b border-rule py-3.5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max font-mono text-[11px] tracking-[0.22em] uppercase text-ink-2 animate-ticker">
          {/* Two identical halves, each padded by one gap, so the 50% keyframe
            shift loops seamlessly; the copy is hidden from screen readers. */}
          <div className="flex gap-[54px] pe-[54px]">{TICKER_ROW}</div>
          <div className="flex gap-[54px] pe-[54px]" aria-hidden="true">
            {TICKER_ROW}
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(Hero)
