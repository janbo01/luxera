import type { FC } from 'react'
import Icon from '../icons/Icon'
import { toFa } from '../../utils/format'

interface QuantityStepperProps {
  value: number
  onDecrement: () => void
  onIncrement: () => void
  className?: string
}

const QuantityStepper: FC<QuantityStepperProps> = ({
  value,
  onDecrement,
  onIncrement,
  className = 'inline-flex items-center gap-1 border border-rule rounded-full p-0.5 text-[14px] [&>button]:w-10 [&>button]:h-10 [&>button]:rounded-full [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:text-muted hover:[&>button]:text-ink',
}) => (
  <div className={className} role="group" aria-label="تعداد">
    <button type="button" onClick={onDecrement} aria-label="کم کردن تعداد" disabled={value <= 1}>
      <Icon name="minus" size={14} />
    </button>
    {/* Announced on change so screen-reader users hear the new quantity */}
    <span aria-live="polite" aria-atomic="true">
      {toFa(value)}
    </span>
    <button type="button" onClick={onIncrement} aria-label="افزودن تعداد">
      <Icon name="plus" size={14} />
    </button>
  </div>
)

export default QuantityStepper
