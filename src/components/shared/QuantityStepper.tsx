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
  className = 'inline-flex items-center gap-2 border border-rule rounded-full px-2.5 py-1 font-mono text-xs [&>button]:w-[18px] [&>button]:h-[18px] [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:text-muted hover:[&>button]:text-ink',
}) => (
  <div className={className}>
    <button onClick={onDecrement} aria-label="کم">
      <Icon name="minus" size={12} />
    </button>
    <span>{toFa(value)}</span>
    <button onClick={onIncrement} aria-label="زیاد">
      <Icon name="plus" size={12} />
    </button>
  </div>
)

export default QuantityStepper
