import { useCallback, useEffect, useRef, type FC } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../icons/Icon'

interface SizeGuideModalProps {
  open: boolean
  onClose: () => void
}

const SIZES = [
  { cm: '۴۰', label: 'چوکر', fit: 'گردن باریک', recommended: false },
  { cm: '۴۲', label: 'کوتاه', fit: 'گردن باریک تا متوسط', recommended: false },
  { cm: '۴۵', label: 'روزانه', fit: 'گردن متوسط', recommended: true },
  { cm: '۵۰', label: 'متوسط', fit: 'همه گردن‌ها', recommended: false },
  { cm: '۵۵', label: 'بلند', fit: 'همه گردن‌ها', recommended: false },
  { cm: '۶۰', label: 'لایه‌بندی', fit: 'همه گردن‌ها', recommended: false },
]

const SizeGuideModal: FC<SizeGuideModalProps> = ({ open, onClose }) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<Element | null>(null)

  const trapFocus = useCallback((e: KeyboardEvent) => {
    const modal = document.getElementById('size-guide-modal')
    if (!modal) return
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }, [])

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
      setTimeout(() => closeBtnRef.current?.focus(), 50)

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
        if (e.key === 'Tab') trapFocus(e)
      }
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKey)
        document.body.style.overflow = ''
        ;(triggerRef.current as HTMLElement | null)?.focus()
      }
    }
  }, [open, onClose, trapFocus])

  if (!open) return null

  return createPortal(
    <>
      <div
        className="sg-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        id="size-guide-modal"
        className="sg-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sg-title"
      >
        <div className="sg-modal__header">
          <h2 className="sg-modal__title" id="sg-title">راهنمای سایز</h2>
          <button
            ref={closeBtnRef}
            className="sg-modal__close"
            onClick={onClose}
            aria-label="بستن راهنمای سایز"
            type="button"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Illustration */}
        <div className="sg-modal__illus" aria-hidden="true">
          <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="sg-illus">
            {/* Neck / shoulder silhouette */}
            <path
              d="M100 10 Q120 8 140 10 Q160 8 180 10 L185 60 Q170 90 155 100 Q150 105 140 108 Q130 105 125 100 Q110 90 95 60 Z"
              fill="var(--plate)" stroke="var(--rule)" strokeWidth="1"
            />
            {/* Necklace lines at different lengths */}
            <ellipse cx="140" cy="100" rx="28" ry="6" stroke="#b8a98a" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.5"/>
            <ellipse cx="140" cy="108" rx="34" ry="8" stroke="#b8a98a" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.5"/>
            {/* 45cm — recommended, drawn solid */}
            <ellipse cx="140" cy="118" rx="42" ry="11" stroke="var(--plum)" strokeWidth="1.5" fill="none"/>
            <circle cx="140" cy="129" r="3" fill="var(--plum)"/>
            <ellipse cx="140" cy="130" rx="50" ry="14" stroke="#b8a98a" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.5"/>
            <ellipse cx="140" cy="144" rx="60" ry="17" stroke="#b8a98a" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.5"/>
            {/* Label for recommended */}
            <text x="196" y="122" fontSize="9" fill="var(--plum)" fontFamily="var(--persian)">۴۵ سانت</text>
          </svg>
        </div>

        {/* Size table */}
        <div className="sg-modal__table-wrap">
          <table className="sg-table">
            <caption className="sr-only">جدول اندازه‌های گردنبند</caption>
            <thead>
              <tr>
                <th>طول</th>
                <th>سبک</th>
                <th>مناسب برای</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s.cm} className={s.recommended ? 'sg-table__row--rec' : ''}>
                  <td dir="ltr">{s.cm} سانت</td>
                  <td>{s.label}</td>
                  <td>{s.fit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="sg-modal__tip">
          نکته: اندازه‌گیری با متر نواری از وسط گردن در جلو انجام دهید.
        </p>
      </div>
    </>,
    document.body,
  )
}

export default SizeGuideModal
