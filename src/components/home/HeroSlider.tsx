import { useState, useEffect, useCallback, type FC, type CSSProperties } from 'react'
import Icon from '../icons/Icon'
import { Illustration } from '../../illustrations'
import { formatPaddedIndex } from '../../utils/format'
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
const ARROW_FLIP: CSSProperties = { transform: 'scaleX(-1)', display: 'inline-flex' }

const FALLBACK_SLIDES: Slide[] = [
  { key: 'plum',   tone: 'plum',   illus: 'NecklaceB', tag: 'N°۰۱ — Mahtab',  caption: 'گردنبند آوای مهتاب' },
  { key: 'sand',   tone: 'sand',   illus: 'RingA',     tag: 'N°۰۲ — Satin',   caption: 'انگشتر ساتن' },
  { key: 'copper', tone: 'copper', illus: 'EarringB',  tag: 'N°۰۳ — Mina',    caption: 'گوشواره میناکار' },
]

function bannerToSlide(b: ApiBanner, i: number): Slide {
  const product = b.product
  const linkUrl = b.link_url || (product ? `/products/${product.id}` : undefined)

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

const HeroSlider: FC<{ onSlide?: (info: SlideInfo) => void }> = ({ onSlide }) => {
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    listBanners()
      .then((banners) => {
        if (banners.length > 0) setSlides(banners.map(bannerToSlide))
      })
      .catch(() => {})
  }, [])

  const total = slides.length

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % total), 5500)
    return () => clearInterval(t)
  }, [total])

  useEffect(() => {
    const s = slides[idx]
    if (s && onSlide) onSlide({ name: s.caption, price: s.price, oldPrice: s.oldPrice })
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
              {slide.imageUrl
                ? <img
                    src={slide.imageUrl}
                    alt={slide.caption}
                    className="w-full h-full object-cover"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'low'}
                    decoding="async"
                  />
                : <Illustration name={slide.illus ?? 'NecklaceB'} />}
            </div>
          </div>
          <span className="hero-slide__caption">{slide.caption}</span>
          {slide.price && (
            <span className="hero-slide__price">
              {slide.oldPrice && (
                <s className="hero-slide__old-price">{slide.oldPrice}</s>
              )}
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
          <Icon name="arrow-left" size={14} />
        </button>
        <button className="hero-slider__arrow" onClick={() => go(idx + 1)} aria-label="بعد">
          <span style={ARROW_FLIP}>
            <Icon name="arrow" size={14} />
          </span>
        </button>
      </div>
    </div>
  )
}

export default HeroSlider
