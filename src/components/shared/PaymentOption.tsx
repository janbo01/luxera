import type { FC } from 'react'

interface PaymentOptionProps {
  modifier: string
  iconChar: string
  name: string
  sub: string
  selected: boolean
  onSelect: () => void
}

const PaymentOption: FC<PaymentOptionProps> = ({ modifier, iconChar, name, sub, selected, onSelect }) => (
  <button
    className={`payment-option ${selected ? 'is-selected' : ''}`}
    onClick={onSelect}
  >
    <div className="payment-option__radio" />
    <div className={`payment-option__icon payment-option__icon--${modifier}`}>{iconChar}</div>
    <div>
      <div className="payment-option__name">{name}</div>
      <div className="payment-option__sub">{sub}</div>
    </div>
  </button>
)

export default PaymentOption
