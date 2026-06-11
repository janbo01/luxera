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
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
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
        className="fixed inset-0 bg-[rgba(26,15,29,0.55)] backdrop-blur-[4px] z-[400] animate-[sg-fade-in_220ms_ease_both]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        id="size-guide-modal"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[401] bg-surface w-[min(480px,92vw)] max-h-[90dvh] overflow-y-auto flex flex-col animate-[sg-rise_300ms_cubic-bezier(.2,.7,.2,1)_both]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sg-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-rule sticky top-0 bg-surface z-[1]">
          <h2 className="font-body font-light text-[18px] m-0 text-ink" id="sg-title">
            راهنمای سایز
          </h2>
          <button
            ref={closeBtnRef}
            className="w-9 h-9 flex items-center justify-center text-muted hover:text-ink transition-colors duration-200 flex-shrink-0"
            onClick={onClose}
            aria-label="بستن راهنمای سایز"
            type="button"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Illustration */}
        <div className="px-6 pt-6 bg-[var(--color-bg-2)]" aria-hidden="true">
          <svg
            viewBox="0 0 280 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-[180px]"
          >
            <path
              d="M100 10 Q120 8 140 10 Q160 8 180 10 L185 60 Q170 90 155 100 Q150 105 140 108 Q130 105 125 100 Q110 90 95 60 Z"
              fill="var(--color-bg-2)"
              stroke="var(--color-rule)"
              strokeWidth="1"
            />
            <ellipse
              cx="140"
              cy="100"
              rx="28"
              ry="6"
              stroke="#b8a98a"
              strokeWidth="1"
              strokeDasharray="3 2"
              fill="none"
              opacity="0.5"
            />
            <ellipse
              cx="140"
              cy="108"
              rx="34"
              ry="8"
              stroke="#b8a98a"
              strokeWidth="1"
              strokeDasharray="3 2"
              fill="none"
              opacity="0.5"
            />
            <ellipse
              cx="140"
              cy="118"
              rx="42"
              ry="11"
              stroke="var(--color-plum)"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="140" cy="129" r="3" fill="var(--color-plum)" />
            <ellipse
              cx="140"
              cy="130"
              rx="50"
              ry="14"
              stroke="#b8a98a"
              strokeWidth="1"
              strokeDasharray="3 2"
              fill="none"
              opacity="0.5"
            />
            <ellipse
              cx="140"
              cy="144"
              rx="60"
              ry="17"
              stroke="#b8a98a"
              strokeWidth="1"
              strokeDasharray="3 2"
              fill="none"
              opacity="0.5"
            />
            <text
              x="196"
              y="122"
              fontSize="9"
              fill="var(--color-plum)"
              fontFamily="var(--font-body)"
            >
              ۴۵ سانت
            </text>
          </svg>
        </div>

        {/* Size table */}
        <div className="px-6 overflow-x-auto">
          <table className="w-full border-collapse font-body text-[13px] m-0">
            <caption className="sr-only">جدول اندازه‌های گردنبند</caption>
            <thead>
              <tr>
                <th className="py-3.5 px-3 text-end font-normal text-[11px] font-mono tracking-[0.1em] text-muted border-b border-rule">
                  طول
                </th>
                <th className="py-3.5 px-3 text-end font-normal text-[11px] font-mono tracking-[0.1em] text-muted border-b border-rule">
                  سبک
                </th>
                <th className="py-3.5 px-3 text-end font-normal text-[11px] font-mono tracking-[0.1em] text-muted border-b border-rule">
                  مناسب برای
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s.cm} className={s.recommended ? 'bg-[rgba(237,227,213,0.5)]' : ''}>
                  <td
                    className={`py-[11px] px-3 border-b border-rule align-middle font-mono whitespace-nowrap ${s.recommended ? 'border-e-2 border-e-plum text-plum font-medium' : 'text-ink'}`}
                    dir="ltr"
                  >
                    {s.cm} سانت
                  </td>
                  <td
                    className={`py-[11px] px-3 border-b border-rule align-middle ${s.recommended ? 'text-ink' : 'text-ink-2'}`}
                  >
                    {s.label}
                  </td>
                  <td
                    className={`py-[11px] px-3 border-b border-rule align-middle ${s.recommended ? 'text-ink' : 'text-ink-2'}`}
                  >
                    {s.fit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[12px] text-muted px-6 py-6 m-0 border-t border-rule mt-2">
          نکته: اندازه‌گیری با متر نواری از وسط گردن در جلو انجام دهید.
        </p>
      </div>
    </>,
    document.body,
  )
}

export default SizeGuideModal
