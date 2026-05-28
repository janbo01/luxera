import { useState, useCallback, type FC } from 'react'
import HeroSlider, { type SlideInfo } from './HeroSlider'
import Icon from '../icons/Icon'
import { BTN_CLS, BTN_GHOST_CLS } from '../ui/Button'
import { formatNumber } from '../../utils/format'

const TICKER_ITEMS = [
  'جواهرات فانتزی',
  'بی‌آلرژی',
  'روکش ماندگار',
  'دست‌ساز در تهران',
  'ارسال یک‌روزه',
  'گارانتی اصالت',
  'طراحی اختصاصی',
]

function fmtPrice(raw?: string): string {
  const n = Number(raw)
  return raw && !isNaN(n) ? formatNumber(n) : (raw ?? '')
}

const Hero: FC = () => {
  const [slide, setSlide] = useState<SlideInfo>({ name: '' })
  const handleSlide = useCallback((info: SlideInfo) => setSlide(info), [])

  return (
  <section className="pt-7">
    <div className="max-w-[1480px] mx-auto px-[var(--pad)] grid grid-cols-[1.15fr_0.85fr] max-md:grid-cols-1 gap-[22px] items-stretch min-h-[560px] max-md:min-h-0">

      {/* ── Dark stage (left) ── */}
      <div className="relative overflow-hidden rounded-[14px] bg-[radial-gradient(120%_80%_at_80%_20%,var(--color-plum-dark)_0%,var(--color-plum)_50%,var(--color-plum-2)_100%)] text-bg isolate before:absolute before:inset-x-[-20%] before:bottom-[-40%] before:h-[60%] before:bg-[radial-gradient(50%_60%_at_50%_50%,rgba(196,135,58,0.25),transparent_70%)] before:blur-[20px] before:-z-0 before:pointer-events-none min-h-[340px] max-md:min-h-[280px] max-md:order-2">

        <div className="absolute inset-0 z-[1]">
          <HeroSlider onSlide={handleSlide} />
        </div>

        {/* Overlay meta at bottom */}
        <div className="absolute bottom-0 inset-x-0 z-[3] flex justify-between items-end gap-5 px-7 pt-5 pb-[60px] bg-[linear-gradient(to_top,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.2)_60%,transparent_100%)]">
          <div>
            <div className="font-heading text-lg font-semibold text-bg">{slide.name}</div>
          </div>
          {slide.price && (
            <div className="flex flex-col items-end gap-0.5">
              {slide.oldPrice && (
                <span className="text-[11px] line-through text-[rgba(245,237,224,0.45)] font-mono">{fmtPrice(slide.oldPrice)}</span>
              )}
              <span className="font-heading text-xl font-bold text-[#E8C9B6]">
                {fmtPrice(slide.price)}
                <small className="font-body text-[11px] font-normal text-[rgba(245,237,224,0.6)] me-1"> تومان</small>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Cream copy panel (right) ── */}
      <div className="rounded-[14px] bg-surface px-10 py-11 flex flex-col max-md:px-6 max-md:py-8 max-md:order-1">
        <span className="font-display italic font-normal text-sm tracking-[0.04em] text-copper-dark inline-flex items-center gap-2.5 mb-[18px] animate-rise [animation-delay:80ms] before:block before:w-[22px] before:h-px before:bg-current before:opacity-60">
          New Arrivals · پاییز ۱۴۰۴
        </span>

        <h1 className="font-heading font-bold text-[clamp(36px,4.2vw,58px)] leading-[1.05] tracking-[-0.01em] m-0 mb-5 text-ink animate-rise [animation-delay:160ms]">
          استایلِ امروز،<br />
          <span className="text-copper-dark relative inline-block after:absolute after:inset-x-0 after:bottom-1 after:h-2.5 after:bg-copper/[0.18] after:-z-10 after:rounded-sm">
            قیمتِ واقعی
          </span>.
        </h1>

        <p className="text-ink-2 text-[15px] leading-[1.8] font-light max-w-[40ch] m-0 mb-7 animate-rise [animation-delay:260ms]">
          جواهرات فانتزی و اکسسوری مد از بهترین برندها — گردنبند،
          دستبند، انگشتر و گوشواره برای هر سبک و هر مناسبت.
          کیفیت خوب، بدون پرداخت هزینه‌ی گزاف.
        </p>

        <div className="flex gap-2.5 flex-wrap mb-auto animate-rise [animation-delay:380ms]">
          <button className={BTN_CLS}>
            مشاهده‌ی محصولات
            <span className="inline-block w-4 h-4 transition-transform duration-200"><Icon name="arrow-left" size={16} /></span>
          </button>
          <button className={BTN_GHOST_CLS}>
            بیشتر بدانید
          </button>
        </div>

        <div className="mt-8 pt-[26px] border-t border-rule grid grid-cols-2 gap-x-[18px] gap-y-4 animate-rise [animation-delay:520ms]">
          {[
            { v: '۱۴', u: 'روز', l: 'ضمانت بازگشت کالا' },
            { v: 'رایگان', u: '', l: 'ارسال بالای ۵۰۰ هزار' },
            { v: '۲۰۰+', u: 'مدل', l: 'محصول موجود' },
          ].map(({ v, u, l }, i) => (
            <div key={i} className={`${i === 0 ? 'pe-[18px] border-e border-rule' : ''}`}>
              <div className="font-heading text-[22px] font-bold text-ink leading-none flex items-baseline gap-1">
                {v}
                {u && <small className="text-xs font-medium text-copper-dark font-body">{u}</small>}
              </div>
              <div className="text-xs text-muted mt-1.5 tracking-[0.02em]">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── Ticker ── */}
    <div className="max-w-[1480px] mx-auto px-[var(--pad)] mt-3.5 border-t border-b border-rule py-3.5 overflow-hidden">
      <div className="flex gap-[54px] w-max font-mono text-[11px] tracking-[0.22em] uppercase text-ink-2 animate-[hero-ticker_38s_linear_infinite]">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2.5">
            <i className="text-copper text-sm not-italic">✦</i> {item}
          </span>
        ))}
      </div>
    </div>
  </section>
  )
}

export default Hero
