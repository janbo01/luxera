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
  plum:   'bg-[linear-gradient(160deg,var(--color-plum-dark),var(--color-plum))] text-[rgba(245,237,224,.9)]',
  copper: 'bg-[linear-gradient(160deg,var(--color-copper),#7A5A22)] text-[rgba(245,237,224,.9)]',
  sand:   'bg-[rgba(245,237,224,.06)]',
}

const Gallery: FC<GalleryProps> = ({ images, productName = 'محصول' }) => {
  const galleryImages = images && images.length > 1 ? images.slice(1) : images
  const count = galleryImages && galleryImages.length > 0 ? galleryImages.length : PRODUCT_GALLERY.length

  const { activeIdx, selectThumb } = useGallery({ count })

  const hasApiImages = galleryImages && galleryImages.length > 0

  return (
    <div className="sticky top-[96px] rounded-[14px] overflow-hidden bg-[linear-gradient(145deg,#2B1C12_0%,#1C1209_60%,#140C06_100%)] text-bg isolate grid [grid-template-columns:112px_1fr] h-[calc(100vh-128px)] before:absolute before:inset-x-[-20%] before:bottom-[-40%] before:h-[60%] before:bg-[radial-gradient(50%_60%_at_50%_50%,rgba(61,43,32,.18),transparent_70%)] before:blur-[20px] before:-z-[1] before:pointer-events-none max-md:grid-cols-1 max-md:[grid-template-rows:auto_1fr] max-lg:static max-lg:h-auto max-lg:flex max-lg:flex-col">
      {/* pthumbs first so RTL auto-placement puts them in column 1 (RIGHT) */}
      <div className="flex flex-col gap-1.5 overflow-y-auto p-2.5 scrollbar-none max-md:flex-row max-md:overflow-x-auto max-md:px-[22px] max-md:pb-[22px] max-md:py-0 max-lg:order-last max-lg:flex-row max-lg:overflow-x-auto max-lg:overflow-y-hidden max-lg:py-2 max-lg:px-3 max-lg:border-t max-lg:border-[rgba(245,237,224,.12)]">
        {hasApiImages
          ? galleryImages.map((img, i) => (
              <button
                key={img.id}
                className={`w-full aspect-[1/1.1] flex-shrink-0 rounded-[8px] overflow-hidden border-2 transition-all duration-200 max-md:w-[60px] max-md:h-[74px] max-lg:w-[60px] max-lg:h-[74px] ${i === activeIdx ? 'border-[var(--color-dust-rose)] bg-[rgba(212,169,142,.12)]' : 'border-transparent hover:border-[rgba(245,237,224,.3)]'}`}
                onClick={() => selectThumb(i)}
                aria-label={`تصویر ${formatPaddedIndex(i + 1)}`}
              >
                <img src={img.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </button>
            ))
          : PRODUCT_GALLERY.map((item, i) => (
              <button
                key={item.tone}
                className={`w-full aspect-[1/1.1] flex-shrink-0 rounded-[8px] overflow-hidden border-2 transition-all duration-200 flex items-center justify-center [&>svg]:w-[60%] [&>svg]:h-auto max-md:w-[60px] max-md:h-[74px] max-lg:w-[60px] max-lg:h-[74px] ${TONE_BG[item.tone] ?? ''} ${i === activeIdx ? 'border-[var(--color-dust-rose)]' : 'border-transparent hover:border-[rgba(245,237,224,.3)]'}`}
                onClick={() => selectThumb(i)}
                aria-label={`تصویر ${formatPaddedIndex(i + 1)}`}
              >
                <Illustration name={item.illus} />
              </button>
            ))}
      </div>

      <div className="relative z-[1] flex flex-col min-h-0 max-sm:h-[340px] max-lg:h-[480px]">
        <div className="flex-1 relative grid place-items-center">
          {hasApiImages
            ? galleryImages.map((img, i) => (
                <div
                  key={img.id}
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${i === activeIdx ? 'opacity-100 pointer-events-auto z-[1]' : 'opacity-0 pointer-events-none z-0'}`}
                >
                  <span className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_40%,rgba(196,135,58,0.08),transparent_70%)] pointer-events-none" />
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
                  <span className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_40%,rgba(196,135,58,0.08),transparent_70%)] pointer-events-none" />
                  <Illustration name={item.illus} />
                </div>
              ))}

          {/* Bottom caption + nav */}
          <div className="absolute bottom-0 inset-x-0 z-[2] flex items-center justify-between px-5 py-4 bg-[linear-gradient(to_top,rgba(20,12,6,0.72)_0%,transparent_100%)] font-mono text-[10px] tracking-[0.16em] uppercase text-[rgba(245,237,224,.6)]">
            <span>
              {formatPaddedIndex(activeIdx + 1)} / {formatPaddedIndex(count)} — {productName}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => selectThumb(Math.max(0, activeIdx - 1))}
                aria-label="تصویر قبلی"
                className="w-8 h-8 rounded-full bg-[rgba(245,237,224,.08)] border border-[rgba(245,237,224,.18)] grid place-items-center text-bg transition-colors hover:bg-[rgba(245,237,224,.16)]"
              >
                <Icon name="arrow-right" size={13} />
              </button>
              <button
                onClick={() => selectThumb(Math.min(count - 1, activeIdx + 1))}
                aria-label="تصویر بعدی"
                className="w-8 h-8 rounded-full bg-[rgba(245,237,224,.08)] border border-[rgba(245,237,224,.18)] grid place-items-center text-bg transition-colors hover:bg-[rgba(245,237,224,.16)] rotate-180"
              >
                <Icon name="arrow-right" size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Gallery
