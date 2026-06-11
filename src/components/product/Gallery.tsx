import type { FC } from 'react'
import Icon from '../icons/Icon'
import { Illustration } from '../../illustrations'
import { formatPaddedIndex } from '../../utils/format'
import { PRODUCT_GALLERY } from '../../data/productDetail'
import { useGallery } from '../../hooks/useGallery'
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
    <div className="lg:sticky lg:top-[96px] rounded-[var(--radius)] overflow-hidden bg-[linear-gradient(145deg,var(--color-plum)_0%,var(--color-plum-2)_100%)] text-bg isolate grid [grid-template-columns:100px_1fr] before:absolute before:inset-x-[-20%] before:bottom-[-40%] before:h-[60%] before:bg-[radial-gradient(50%_60%_at_50%_50%,color-mix(in_srgb,var(--color-plum)_18%,transparent),transparent_70%)] before:blur-[20px] before:-z-[1] before:pointer-events-none max-lg:relative max-lg:flex max-lg:flex-col">
      {/* thumbs first so RTL auto-placement puts them in column 1 (RIGHT) */}
      <div className="flex flex-col gap-1.5 overflow-y-auto p-2 scrollbar-none max-lg:order-last max-lg:flex-row max-lg:overflow-x-auto max-lg:overflow-y-hidden max-lg:py-2 max-lg:px-3 max-lg:border-t max-lg:border-bg/[12%]">
        {hasApiImages
          ? galleryImages.map((img, i) => (
              <button
                key={img.id}
                className={`w-full aspect-square flex-shrink-0 rounded-[8px] overflow-hidden border-2 transition-all duration-200 max-lg:w-[58px] max-lg:h-[58px] ${i === activeIdx ? 'border-[var(--color-dust-rose)] bg-dust-rose/[12%]' : 'border-transparent hover:border-bg/30'}`}
                onClick={() => selectThumb(i)}
                aria-label={`تصویر ${formatPaddedIndex(i + 1)}`}
              >
                <img
                  src={img.url}
                  alt={`${productName} - تصویر ${formatPaddedIndex(i + 1)}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))
          : PRODUCT_GALLERY.map((item, i) => (
              <button
                key={item.tone}
                className={`w-full aspect-square flex-shrink-0 rounded-[8px] overflow-hidden border-2 transition-all duration-200 flex items-center justify-center [&>svg]:w-[60%] [&>svg]:h-auto max-lg:w-[58px] max-lg:h-[58px] ${TONE_BG[item.tone] ?? ''} ${i === activeIdx ? 'border-[var(--color-dust-rose)]' : 'border-transparent hover:border-bg/30'}`}
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
                  src={img.url}
                  alt={`${productName} - تصویر ${i + 1}`}
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
        <div className="absolute bottom-0 inset-x-0 z-[2] flex items-center justify-between px-5 py-4 bg-[linear-gradient(to_top,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.2)_60%,transparent_100%)] font-mono text-[10px] tracking-[0.16em] uppercase text-bg/60">
          <span>
            {formatPaddedIndex(activeIdx + 1)} / {formatPaddedIndex(count)} — {productName}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => selectThumb(Math.max(0, activeIdx - 1))}
              aria-label="تصویر قبلی"
              className="w-8 h-8 rounded-full bg-bg/[8%] border border-bg/[18%] grid place-items-center text-bg transition-colors hover:bg-bg/[16%]"
            >
              <Icon name="arrow-right" size={13} />
            </button>
            <button
              onClick={() => selectThumb(Math.min(count - 1, activeIdx + 1))}
              aria-label="تصویر بعدی"
              className="w-8 h-8 rounded-full bg-bg/[8%] border border-bg/[18%] grid place-items-center text-bg transition-colors hover:bg-bg/[16%] rotate-180"
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
