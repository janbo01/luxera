import { useState, memo, type FC } from 'react'
import type { ApiBanner } from '../../api/store'

import HeroSlider, { type SlideInfo, getFirstSlideInfo } from './HeroSlider'
import Icon from '../icons/Icon'
import { BTN_CLS } from '../ui/Button'
import { formatNumber, jalaliSeason } from '../../utils/format'

function fmtPrice(raw?: string): string {
  const n = Number(raw)
  return raw && !isNaN(n) ? formatNumber(n) : (raw ?? '')
}

const Hero: FC<{ banners?: ApiBanner[] }> = ({ banners }) => {
  // Pre-populate the overlay with the first slide's info so SSR already shows the
  // banner's name and price — no repaint when useLayoutEffect reports the slide.
  const [slide, setSlide] = useState<SlideInfo>(() => getFirstSlideInfo(banners))

  return (
    <section className="pt-4 md:pt-7">
      <div className="max-w-[1480px] mx-auto px-[var(--pad)] grid grid-cols-[1.2fr_0.8fr] max-md:grid-cols-1 gap-3 md:gap-8 items-stretch min-h-[420px] max-md:min-h-0">
        {/* ── Dark stage (left) ── */}
        <div className="relative overflow-hidden rounded-[var(--radius)] bg-[radial-gradient(120%_80%_at_80%_20%,var(--color-plum-dark)_0%,var(--color-plum)_50%,var(--color-plum-2)_100%)] text-bg isolate before:absolute before:inset-x-[-20%] before:bottom-[-40%] before:h-[60%] before:bg-[radial-gradient(50%_60%_at_50%_50%,color-mix(in_srgb,var(--color-copper)_25%,transparent),transparent_70%)] before:blur-[20px] before:-z-0 before:pointer-events-none min-h-[340px] max-md:min-h-0 max-md:aspect-[4/3]">
          {/* No z-index on this wrapper: it must not form a stacking context, or the
              scrim below (z-3) would paint over the slider's arrows and counter (z-10). */}
          <div className="absolute inset-0">
            <HeroSlider onSlide={setSlide} banners={banners} />
          </div>

          {/* Overlay meta at bottom */}
          <div className="absolute bottom-0 inset-x-0 z-[3] flex justify-between items-end gap-5 px-5 md:px-8 pt-24 pb-5 md:pb-7 bg-[linear-gradient(to_top,rgb(0_0_0/0.72)_0%,rgb(0_0_0/0.38)_45%,transparent_100%)] pointer-events-none">
            <div className="min-w-0">
              <div className="text-[12.5px] text-white/80 leading-none mb-2">منتخب</div>
              {slide.href ? (
                <a
                  href={slide.href}
                  className="pointer-events-auto block font-heading text-lg md:text-[24px] font-bold text-white leading-[1.35] line-clamp-2 underline-offset-[6px] decoration-1 hover:underline focus-visible:outline-white"
                >
                  {slide.name}
                </a>
              ) : (
                <div className="font-heading text-lg md:text-[24px] font-bold text-white leading-[1.35] line-clamp-2">
                  {slide.name}
                </div>
              )}
            </div>
            {slide.price ? (
              <div className="flex flex-col items-end gap-1 shrink-0 [font-feature-settings:'tnum']">
                {slide.oldPrice ? (
                  <span className="text-[13px] line-through text-white/65 leading-none">
                    {fmtPrice(slide.oldPrice)}
                  </span>
                ) : null}
                <span className="font-heading text-xl md:text-[26px] font-bold text-white whitespace-nowrap leading-none">
                  {fmtPrice(slide.price)}
                  <small className="font-body text-[12.5px] font-normal text-white/80 ms-1.5">
                    تومان
                  </small>
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Copy (right) — open on the page background, not a second card. On phones it
            shrinks to the headline and CTA so the first products arrive sooner. ── */}
        <div className="relative flex flex-col justify-center isolate py-[clamp(4px,2.4vw,40px)] md:pe-[clamp(0px,1.5vw,24px)]">
          {/* Soft brand-tinted glow in the corner — derived from theme tokens */}
          <div
            aria-hidden="true"
            className="absolute -top-1/4 -start-1/4 w-[80%] aspect-square rounded-full max-md:hidden bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-copper)_12%,transparent),transparent)] -z-10 pointer-events-none"
          />

          <span className="inline-flex items-center gap-2 mb-4 md:mb-6 animate-rise [animation-delay:80ms] max-md:hidden">
            <span className="w-5 h-px bg-copper-dark opacity-70" />
            <span className="text-[13px] font-medium text-copper-dark">تازه‌ها</span>
            <span className="text-copper-dark/50" aria-hidden="true">
              ·
            </span>
            <span className="text-[13px] text-copper-dark">{jalaliSeason()}</span>
          </span>

          <h1 className="font-heading font-bold text-[clamp(28px,4.2vw,56px)] leading-[1.08] tracking-[-0.01em] m-0 mb-4 md:mb-6 text-ink animate-rise [animation-delay:160ms]">
            استایلِ امروز،
            <br />
            <span className="text-copper-dark relative inline-block after:absolute after:-inset-x-1 after:bottom-[0.16em] after:h-[0.3em] after:bg-copper/[0.16] after:-z-10 after:rounded-sm">
              قیمتِ واقعی
            </span>
            .
          </h1>

          <p className="text-ink-2 text-[15px] md:text-[16px] leading-[1.9] max-w-[40ch] m-0 mb-7 md:mb-9 animate-rise [animation-delay:260ms] max-md:hidden">
            جواهرات فانتزی و اکسسوری مد از بهترین برندها — گردنبند، دستبند، انگشتر و گوشواره برای هر
            سبک و هر مناسبت. کیفیت خوب، بدون پرداخت هزینه‌ی گزاف.
          </p>

          <div className="flex items-center gap-5 flex-wrap animate-rise [animation-delay:380ms]">
            <a href="/category/new" className={`${BTN_CLS} max-sm:flex-1 max-sm:justify-center`}>
              مشاهده‌ی محصولات
              <span className="arr">
                <Icon name="arrow-left" size={16} />
              </span>
            </a>
            <a href="/about" className="link-draw">
              بیشتر بدانید
              <span className="sr-only"> درباره‌ی لوکسرا</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default memo(Hero)
