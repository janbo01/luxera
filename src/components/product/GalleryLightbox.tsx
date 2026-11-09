import { useCallback, useEffect, useRef, useState, type FC } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../icons/Icon'
import { useBodyLock } from '../../hooks/useBodyLock'
import { imgUrl } from '../../utils/cdnImage'
import { toFa } from '../../utils/format'
import type { ApiProductImage } from '../../api/product'

interface GalleryLightboxProps {
  images: ApiProductImage[]
  index: number
  productName: string
  onIndexChange: (i: number) => void
  onClose: () => void
}

/** Full-screen viewer. Tap the photo to zoom in and scroll to pan; arrows and Escape work too. */
const GalleryLightbox: FC<GalleryLightboxProps> = ({
  images,
  index,
  productName,
  onIndexChange,
  onClose,
}) => {
  const [zoomed, setZoomed] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  useBodyLock(true)

  // Move focus into the dialog and hand it back to whatever opened it.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => opener?.focus?.()
  }, [])

  // Each photo opens un-zoomed and scrolled to the top-left.
  useEffect(() => {
    scrollerRef.current?.scrollTo(0, 0)
  }, [index])

  const go = useCallback(
    (i: number) => {
      setZoomed(false)
      onIndexChange(i)
    },
    [onIndexChange],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      // The page is RTL, so "next" is the left arrow.
      if (e.key === 'ArrowLeft') go(Math.min(images.length - 1, index + 1))
      if (e.key === 'ArrowRight') go(Math.max(0, index - 1))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, images.length, onClose, go])

  const img = images[index]
  const nav =
    'absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface/90 text-ink grid place-items-center shadow-[var(--shadow-soft)] disabled:opacity-30 z-10'

  // Portal to <body>: the gallery card creates its own stacking context, which would trap
  // the overlay underneath the sticky header.
  return createPortal(
    <div
      className="fixed inset-0 z-[300] bg-[rgba(14,10,12,0.94)] flex flex-col animate-overlay-in"
      role="dialog"
      aria-modal="true"
      aria-label={`نمای بزرگ ${productName}`}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white/90">
        <span className="font-mono text-[13px]">
          {toFa(index + 1)} / {toFa(images.length)}
        </span>
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="بستن"
          className="w-12 h-12 rounded-full grid place-items-center hover:bg-white/10"
        >
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollerRef}
          className={`absolute inset-0 overflow-auto ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in grid place-items-center'}`}
          onClick={() => setZoomed((z) => !z)}
        >
          <img
            src={imgUrl(img.url, 1600, 1600)}
            alt={`${productName} - تصویر ${index + 1}`}
            className={
              zoomed
                ? 'max-w-none w-[220%] sm:w-[160%] h-auto'
                : 'max-w-full max-h-full object-contain'
            }
            draggable={false}
          />
        </div>
        {images.length > 1 && (
          <>
            <button
              className={`${nav} end-3`}
              onClick={() => go(Math.max(0, index - 1))}
              disabled={index === 0}
              aria-label="تصویر قبلی"
            >
              <Icon name="arrow-right" size={16} />
            </button>
            <button
              className={`${nav} start-3`}
              onClick={() => go(Math.min(images.length - 1, index + 1))}
              disabled={index === images.length - 1}
              aria-label="تصویر بعدی"
            >
              <Icon name="arrow-left" size={16} />
            </button>
          </>
        )}
      </div>
      <p className="m-0 py-3 text-center text-[12.5px] text-white/70">
        {zoomed ? 'برای کوچک‌کردن لمس کنید' : 'برای بزرگ‌نمایی روی تصویر بزنید'}
      </p>
    </div>,
    document.body,
  )
}

export default GalleryLightbox
