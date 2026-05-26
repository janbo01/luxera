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

const Gallery: FC<GalleryProps> = ({ images, productName = 'محصول' }) => {
  const galleryImages = images && images.length > 1 ? images.slice(1) : images
  const count = galleryImages && galleryImages.length > 0 ? galleryImages.length : PRODUCT_GALLERY.length

  const { activeIdx, selectThumb } = useGallery({ count })

  const hasApiImages = galleryImages && galleryImages.length > 0

  return (
    <div className="pstage-col">
      {/* pthumbs first so RTL auto-placement puts them in column 1 (RIGHT) */}
      <div className="pthumbs">
        {hasApiImages
          ? galleryImages.map((img, i) => (
              <button
                key={img.id}
                className={`pthumb ${i === activeIdx ? 'is-active' : ''}`}
                onClick={() => selectThumb(i)}
                aria-label={`تصویر ${formatPaddedIndex(i + 1)}`}
              >
                <img src={img.url} alt="" className="img-cover" />
              </button>
            ))
          : PRODUCT_GALLERY.map((item, i) => (
              <button
                key={item.tone}
                className={`pthumb pthumb--${item.tone} ${i === activeIdx ? 'is-active' : ''}`}
                onClick={() => selectThumb(i)}
                aria-label={`تصویر ${formatPaddedIndex(i + 1)}`}
              >
                <Illustration name={item.illus} />
              </button>
            ))}
      </div>

      <div className="pstage">
<div className="pstage__canvas">
          {hasApiImages
            ? galleryImages.map((img, i) => (
                <div
                  key={img.id}
                  className={`pstage__view ${i === activeIdx ? 'is-active' : ''}`}
                >
                  <span className="pstage__glow" />
                  <img
                    src={img.url}
                    alt={`${productName} - تصویر ${i + 1}`}
                    className="pstage__img"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              ))
            : PRODUCT_GALLERY.map((item, i) => (
                <div
                  key={item.tone}
                  className={`pstage__view ${i === activeIdx ? 'is-active' : ''}`}
                >
                  <span className="pstage__glow" />
                  <Illustration name={item.illus} />
                </div>
              ))}
          <div className="pstage__bottom">
            <span>
              {formatPaddedIndex(activeIdx + 1)} / {formatPaddedIndex(count)} — {productName}
            </span>
            <div className="pstage__nav">
              <button
                onClick={() => selectThumb(Math.max(0, activeIdx - 1))}
                aria-label="تصویر قبلی"
              >
                <Icon name="arrow-right" size={13} />
              </button>
              <button
                onClick={() => selectThumb(Math.min(count - 1, activeIdx + 1))}
                aria-label="تصویر بعدی"
                className="pstage__nav-next"
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
