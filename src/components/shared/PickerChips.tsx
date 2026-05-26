import type { FC } from 'react'

interface PickerChipsProps {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}

const PickerChips: FC<PickerChipsProps> = ({ label, options, value, onChange }) => (
  <div>
    <div className="picker-label">{label}</div>
    <div className="picker-chips">
      {options.map((opt) => (
        <button
          key={opt}
          className={`picker-chip ${value === opt ? 'is-active' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
)

export default PickerChips
