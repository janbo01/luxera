import { useEffect, type FC, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useBodyLock } from '../../hooks/useBodyLock'

interface ModalProps {
  onClose: () => void
  children: ReactNode
  className?: string
  ariaLabel?: string
}

export const Modal: FC<ModalProps> = ({ onClose, children, className = '', ariaLabel }) => {
  useBodyLock(true)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 bg-[var(--color-overlay)] backdrop-blur-md z-[300] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`bg-surface border border-rule rounded-[var(--radius)] w-full max-w-[520px] max-h-[90vh] overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(27,15,29,0.18)]${className ? ` ${className}` : ''}`}>
        {children}
      </div>
    </div>,
    document.body,
  )
}
