import type { FC } from 'react'

interface PickerChipsProps {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}

const PickerChips: FC<PickerChipsProps> = ({ label, options, value, onChange }) => (
  <div>
    <div className="text-xs font-medium text-ink mb-2">{label}</div>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          className={`px-4 py-2 text-sm rounded-full border transition-all duration-150 cursor-pointer font-[inherit] ${
            value === opt
              ? 'bg-ink text-bg border-ink'
              : 'bg-transparent text-ink border-rule hover:border-ink-2'
          }`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
)

export default PickerChips
