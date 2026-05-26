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
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`modal-panel${className ? ` ${className}` : ''}`}>
        {children}
      </div>
    </div>,
    document.body,
  )
}
