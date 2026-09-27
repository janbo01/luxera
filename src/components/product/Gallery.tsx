import type { FC } from 'react'
import Icon from '../icons/Icon'
import { Illustration } from '../../illustrations'
import { formatPaddedIndex } from '../../utils/format'
import { PRODUCT_GALLERY } from '../../data/productDetail'
import { useGallery } from '../../hooks/useGallery'
import { imgSet, imgUrl } from '../../utils/cdnImage'
import type { ApiProductImage } from '../../api/product'

interface GalleryProps {
  images?: ApiProductImage[]
  productName?: string
}

const TONE_BG: Record<string, string> = {
  plum: 'bg-[linear-gradient(160deg,var(--color-plum-dark),var(--color-plum))] text-bg/90',
  copper: 'bg-[linear-gradient(160deg,var(--color-copper),var(--color-copper-dark))] text-bg/90',
  sand: 'bg-bg/[6%]',
}

const Gallery: FC<GalleryProps> = ({ images, productName = 'محصول' }) => {
  const galleryImages = images
  const count =
    galleryImages && galleryImages.length > 0 ? galleryImages.length : PRODUCT_GALLERY.length

  const { activeIdx, selectThumb } = useGallery({ count })

  const hasApiImages = galleryImages && galleryImages.length > 0

  return (
    <div className="lg:sticky lg:top-[96px] rounded-[var(--radius)] overflow-hidden bg-surface ring-1 ring-inset ring-rule text-ink isolate grid [grid-template-columns:100px_1fr] max-lg:relative max-lg:flex max-lg:flex-col">
      {/* thumbs first so RTL auto-placement puts them in column 1 (RIGHT) */}
      <div className="flex flex-col gap-1.5 overflow-y-auto p-2 scrollbar-none max-lg:order-last max-lg:flex-row max-lg:overflow-x-auto max-lg:overflow-y-hidden max-lg:py-2 max-lg:px-3 max-lg:border-t max-lg:border-rule">
        {hasApiImages
          ? galleryImages.map((img, i) => (
              <button
                key={img.id}
                className={`w-full aspect-square flex-shrink-0 rounded-[8px] overflow-hidden border-2 transition-all duration-200 max-lg:w-[58px] max-lg:h-[58px] ${i === activeIdx ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100 hover:border-rule'}`}
                onClick={() => selectThumb(i)}
                aria-label={`تصویر ${formatPaddedIndex(i + 1)}`}
              >
                <img
                  src={imgUrl(img.url, 200, 200)}
                  alt={`${productName} - تصویر ${formatPaddedIndex(i + 1)}`}
                  width={100}
                  height={100}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))
          : PRODUCT_GALLERY.map((item, i) => (
              <button
                key={item.tone}
                className={`w-full aspect-square flex-shrink-0 rounded-[8px] overflow-hidden border-2 transition-all duration-200 flex items-center justify-center [&>svg]:w-[60%] [&>svg]:h-auto max-lg:w-[58px] max-lg:h-[58px] ${TONE_BG[item.tone] ?? ''} ${i === activeIdx ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100 hover:border-rule'}`}
                onClick={() => selectThumb(i)}
                aria-label={`تصویر ${formatPaddedIndex(i + 1)}`}
              >
                <Illustration name={item.illus} />
              </button>
            ))}
      </div>

      {/* Main image — 1:1 square */}
      <div className="relative z-[1] aspect-square max-sm:aspect-[4/3]">
        {hasApiImages
          ? galleryImages.map((img, i) => (
              <div
                key={img.id}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${i === activeIdx ? 'opacity-100 pointer-events-auto z-[1]' : 'opacity-0 pointer-events-none z-0'}`}
              >
                <span className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_40%,color-mix(in_srgb,var(--color-copper)_8%,transparent),transparent_70%)] pointer-events-none" />
                <img
                  {...imgSet(img.url, {
                    widths: [480, 640, 960, 1280],
                    sizes: '(max-width: 1024px) 100vw, 45vw',
                  })}
                  alt={`${productName} - تصویر ${i + 1}`}
                  width={960}
                  height={960}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  decoding="async"
                />
              </div>
            ))
          : PRODUCT_GALLERY.map((item, i) => (
              <div
                key={item.tone}
                className={`absolute inset-0 flex items-center justify-center [&>svg]:w-[48%] [&>svg]:h-auto transition-opacity duration-300 ${i === activeIdx ? 'opacity-100 pointer-events-auto z-[1]' : 'opacity-0 pointer-events-none z-0'}`}
              >
                <span className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_40%,color-mix(in_srgb,var(--color-copper)_8%,transparent),transparent_70%)] pointer-events-none" />
                <Illustration name={item.illus} />
              </div>
            ))}

        {/* Bottom caption + nav */}
        <div className="absolute bottom-0 inset-x-0 z-[2] flex items-center justify-between p-3 sm:p-4 pointer-events-none">
          <span
            className="font-mono text-[11px] tracking-[0.12em] text-ink bg-surface/85 backdrop-blur-[8px] rounded-full px-3 py-1.5 shadow-[var(--shadow-soft)]"
            aria-label={`تصویر ${activeIdx + 1} از ${count} — ${productName}`}
          >
            {formatPaddedIndex(activeIdx + 1)} / {formatPaddedIndex(count)}
          </span>
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => selectThumb(Math.max(0, activeIdx - 1))}
              aria-label="تصویر قبلی"
              className="w-11 h-11 rounded-full bg-surface/90 backdrop-blur-[8px] shadow-[var(--shadow-soft)] grid place-items-center text-ink transition-colors hover:bg-ink hover:text-bg disabled:opacity-40"
            >
              <Icon name="arrow-right" size={13} />
            </button>
            <button
              onClick={() => selectThumb(Math.min(count - 1, activeIdx + 1))}
              aria-label="تصویر بعدی"
              className="w-11 h-11 rounded-full bg-surface/90 backdrop-blur-[8px] shadow-[var(--shadow-soft)] grid place-items-center text-ink transition-colors hover:bg-ink hover:text-bg disabled:opacity-40 rotate-180"
            >
              <Icon name="arrow-right" size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Gallery
