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
  className = 'qty-stepper',
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
