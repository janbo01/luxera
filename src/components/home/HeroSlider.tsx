import { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef, type FC } from 'react'
import Icon from '../icons/Icon'
import { Illustration } from '../../illustrations'
import { formatPaddedIndex } from '../../utils/format'
import { useHydrated } from '../../hooks/useHydrated'
import type { HeroTone } from '../../types'
import { listBanners, type ApiBanner } from '../../api/store'

interface Slide {
  key: string
  tone: HeroTone
  illus?: string
  imageUrl?: string
  linkUrl?: string
  tag: string
  caption: string
  price?: string
  oldPrice?: string
}

export interface SlideInfo {
  name: string
  price?: string
  oldPrice?: string
}

const TONES: HeroTone[] = ['plum', 'sand', 'copper']

const FALLBACK_SLIDES: Slide[] = [
  {
    key: 'plum',
    tone: 'plum',
    illus: 'NecklaceB',
    tag: 'N°۰۱ — Mahtab',
    caption: 'گردنبند آوای مهتاب',
  },
  { key: 'sand', tone: 'sand', illus: 'RingA', tag: 'N°۰۲ — Satin', caption: 'انگشتر ساتن' },
  {
    key: 'copper',
    tone: 'copper',
    illus: 'EarringB',
    tag: 'N°۰۳ — Mina',
    caption: 'گوشواره میناکار',
  },
]

function bannerToSlide(b: ApiBanner, i: number): Slide {
  const product = b.product
  const linkUrl = b.link_url || (product ? `/product/${product.slug ?? product.id}` : undefined)

  return {
    key: b.id,
    tone: TONES[i % TONES.length],
    imageUrl: b.image_url || product?.image_url || undefined,
    linkUrl,
    tag: b.subtitle || `N°${String(i + 1).padStart(2, '0')}`,
    caption: b.title || product?.title_fa || product?.title || '',
    price: product?.price || undefined,
    oldPrice: product?.old_price || undefined,
  }
}

declare global {
  interface Window {
    __BANNERS_INITIAL__?: ApiBanner[]
  }
}

// Always FALLBACK_SLIDES for the initial render so SSR (which has no window) and the
// client's first render produce identical markup. Reading window.__BANNERS_INITIAL__
// here would diverge from SSR and crash hydration (React #418). The injected banners
// are applied after mount in an effect (see below).
function getInitialSlides(): Slide[] {
  return FALLBACK_SLIDES
}

export function getFirstSlideInfo(): SlideInfo {
  const first = getInitialSlides()[0]
  return { name: first?.caption ?? '', price: first?.price, oldPrice: first?.oldPrice }
}

const HeroSlider: FC<{ onSlide?: (info: SlideInfo) => void }> = ({ onSlide }) => {
  const hydrated = useHydrated()
  // Banners fetched on the client when none were injected at SSR time.
  const [fetchedSlides, setFetchedSlides] = useState<Slide[] | null>(null)
  const [idx, setIdx] = useState(0)
  const onSlideRef = useRef(onSlide)
  useLayoutEffect(() => {
    onSlideRef.current = onSlide
  })

  // First render (SSR + pre-hydration client) uses FALLBACK_SLIDES so the markup matches
  // and hydration doesn't crash (React #418). After mount we swap in the SSR-injected
  // banners (window.__BANNERS_INITIAL__), or the client-fetched ones as a fallback.
  const slides = useMemo<Slide[]>(() => {
    if (fetchedSlides) return fetchedSlides
    if (hydrated && typeof window !== 'undefined' && window.__BANNERS_INITIAL__?.length) {
      return window.__BANNERS_INITIAL__.map(bannerToSlide)
    }
    return FALLBACK_SLIDES
  }, [hydrated, fetchedSlides])

  useEffect(() => {
    if (window.__BANNERS_INITIAL__?.length) return
    listBanners()
      .then((banners) => {
        if (banners.length > 0) setFetchedSlides(banners.map(bannerToSlide))
      })
      .catch(() => {})
  }, [])

  const total = slides.length

  useEffect(() => {
    // No autoplay for a single slide or when the user prefers reduced motion.
    if (total <= 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setIdx((i) => (i + 1) % total), 5500)
    return () => clearInterval(t)
  }, [total])

  useLayoutEffect(() => {
    const s = slides[idx]
    if (s) onSlideRef.current?.({ name: s.caption, price: s.price, oldPrice: s.oldPrice })
  }, [idx, slides])

  const go = useCallback((n: number) => setIdx((n + total) % total), [total])

  return (
    <div className="hero-slider">
      {slides.map((slide, i) => (
        <div
          key={slide.key}
          className={`hero-slide hero-slide--${slide.tone} ${i === idx ? 'is-active' : ''}`}
        >
          <span className="hero-slide__tag">{slide.tag}</span>
          <div className="hero-slide__art">
            <div className={slide.imageUrl ? 'has-image' : ''}>
              {slide.imageUrl ? (
                <img
                  src={slide.imageUrl}
                  alt={slide.caption}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                  decoding="async"
                />
              ) : (
                <Illustration name={slide.illus ?? 'NecklaceB'} />
              )}
            </div>
          </div>
          <span className="hero-slide__caption">{slide.caption}</span>
          {slide.price && (
            <span className="hero-slide__price">
              {slide.oldPrice && <s className="hero-slide__old-price">{slide.oldPrice}</s>}
              {slide.price}
            </span>
          )}
        </div>
      ))}

      <span className="hero-slider__count">
        {formatPaddedIndex(idx + 1)} / {formatPaddedIndex(total)}
      </span>

      <div className="hero-slider__nav">
        {slides.map((slide, i) => (
          <button
            key={slide.key}
            className={`hero-slider__dot ${i === idx ? 'is-active' : ''}`}
            onClick={() => go(i)}
            aria-label={`اسلاید ${i + 1}`}
          />
        ))}
      </div>

      <div className="hero-slider__arrows">
        <button className="hero-slider__arrow" onClick={() => go(idx - 1)} aria-label="قبل">
          <Icon name="arrow-right" size={14} />
        </button>
        <button className="hero-slider__arrow" onClick={() => go(idx + 1)} aria-label="بعد">
          <Icon name="arrow-left" size={14} />
        </button>
      </div>
    </div>
  )
}

export default HeroSlider
