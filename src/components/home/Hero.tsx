import { useState, useCallback, type FC } from 'react'
import { Link } from 'react-router-dom'
import HeroSlider, { type SlideInfo, getFirstSlideInfo } from './HeroSlider'
import Icon from '../icons/Icon'
import { BTN_CLS, BTN_GHOST_CLS } from '../ui/Button'
import { formatNumber } from '../../utils/format'
import { useInitialData } from '../../context/initialData'

const TICKER_ITEMS = [
  'جواهرات فانتزی',
  'بی‌آلرژی',
  'روکش ماندگار',
  'دست‌ساز در تهران',
  'ارسال یک‌روزه',
  'گارانتی اصالت',
  'طراحی اختصاصی',
]

const TICKER_DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS]

const HERO_STATS = [
  { v: '۱۴', u: 'روز', l: 'ضمانت بازگشت' },
  { v: 'رایگان', u: '', l: 'ارسال بالای ۵۰۰ هزار' },
  { v: '۲۰۰+', u: 'مدل', l: 'محصول موجود' },
] as const

function fmtPrice(raw?: string): string {
  const n = Number(raw)
  return raw && !isNaN(n) ? formatNumber(n) : (raw ?? '')
}

const Hero: FC = () => {
  const { banners: ssrBanners } = useInitialData()
  // Pre-populate the overlay with the first slide's info so SSR and the initial
  // client render agree — avoids a repaint-driven layout shift when the name
  // appears after useLayoutEffect fires in HeroSlider.
  const [slide, setSlide] = useState<SlideInfo>(() => getFirstSlideInfo(ssrBanners))
  const handleSlide = useCallback((info: SlideInfo) => setSlide(info), [])

  return (
  <section className="pt-7">
    <div className="max-w-[1480px] mx-auto px-[var(--pad)] grid grid-cols-[1.15fr_0.85fr] max-md:grid-cols-1 gap-[22px] items-stretch min-h-[560px] max-md:min-h-0">

      {/* ── Dark stage (left) ── */}
      <div className="relative overflow-hidden rounded-[var(--radius)] bg-[radial-gradient(120%_80%_at_80%_20%,var(--color-plum-dark)_0%,var(--color-plum)_50%,var(--color-plum-2)_100%)] text-bg isolate before:absolute before:inset-x-[-20%] before:bottom-[-40%] before:h-[60%] before:bg-[radial-gradient(50%_60%_at_50%_50%,rgba(196,135,58,0.25),transparent_70%)] before:blur-[20px] before:-z-0 before:pointer-events-none min-h-[340px] max-md:min-h-[280px] max-md:order-2">

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
              <span className="font-heading text-xl font-bold text-[var(--color-dust-rose-light)]">
                {fmtPrice(slide.price)}
                <small className="font-body text-[11px] font-normal text-[rgba(245,237,224,0.6)] me-1"> تومان</small>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Cream copy panel (right) ── */}
      <div className="rounded-[var(--radius)] bg-surface px-10 py-11 flex flex-col max-md:px-6 max-md:py-8 max-md:order-1">
        <span className="inline-flex items-center gap-2 mb-5 animate-rise [animation-delay:80ms]">
          <span className="w-5 h-px bg-copper-dark opacity-70" />
          <span className="font-display italic font-normal text-sm tracking-[0.04em] text-copper-dark">
            New Arrivals · پاییز ۱۴۰۴
          </span>
        </span>

        <h1 className="font-heading font-bold text-[clamp(34px,4vw,56px)] leading-[1.05] tracking-[-0.01em] m-0 mb-5 text-ink animate-rise [animation-delay:160ms]">
          استایلِ امروز،<br />
          <span className="text-copper-dark relative inline-block after:absolute after:inset-x-0 after:bottom-1 after:h-2.5 after:bg-copper/[0.18] after:-z-10 after:rounded-sm">
            قیمتِ واقعی
          </span>.
        </h1>

        <p className="text-ink-2 text-[14.5px] leading-[1.85] font-light max-w-[38ch] m-0 mb-8 animate-rise [animation-delay:260ms]">
          جواهرات فانتزی و اکسسوری مد از بهترین برندها — گردنبند،
          دستبند، انگشتر و گوشواره برای هر سبک و هر مناسبت.
          کیفیت خوب، بدون پرداخت هزینه‌ی گزاف.
        </p>

        <div className="flex gap-2.5 flex-wrap mb-auto animate-rise [animation-delay:380ms]">
          <Link to="/category/new" className={BTN_CLS}>
            مشاهده‌ی محصولات
            <span className="arr"><Icon name="arrow-left" size={16} /></span>
          </Link>
          <a href="#about" className={BTN_GHOST_CLS}>
            بیشتر بدانید
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-rule grid grid-cols-3 animate-rise [animation-delay:520ms]">
          {HERO_STATS.map(({ v, u, l }, i) => (
            <div key={i} className={`${i < 2 ? 'pe-4 border-e border-rule me-4' : ''}`}>
              <div className="font-heading text-[20px] font-bold text-ink leading-none flex items-baseline gap-1">
                {v}
                {u && <small className="text-[11px] font-medium text-copper-dark font-body">{u}</small>}
              </div>
              <div className="text-[11px] text-muted mt-1.5 leading-[1.4]">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── Ticker ── */}
    <div className="max-w-[1480px] mx-auto px-[var(--pad)] mt-3.5 border-t border-b border-rule py-3.5 overflow-hidden">
      <div className="flex gap-[54px] w-max font-mono text-[11px] tracking-[0.22em] uppercase text-ink-2 animate-[hero-ticker_38s_linear_infinite]">
        {TICKER_DOUBLED.map((item, i) => (
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
