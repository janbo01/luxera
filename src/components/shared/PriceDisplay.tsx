import type { FC } from 'react'
import { formatToman } from '../../utils/format'

interface PriceDisplayProps {
  price: number
  oldPrice?: number | null
  className: string
  oldClassName: string
}

const PriceDisplay: FC<PriceDisplayProps> = ({ price, oldPrice, className, oldClassName }) => (
  <div className={className}>
    {formatToman(price)}
    {oldPrice && <span className={oldClassName}>{formatToman(oldPrice)}</span>}
  </div>
)

export default PriceDisplay
