import type { FC } from 'react'

interface BadgeProps {
  label?: string | null
  kind?: string
}

const KIND_CLASS: Record<string, string> = {
  sale: 'bg-sale text-white',
  new: 'bg-plum text-white',
  limited: 'bg-gold text-ink',
}

const Badge: FC<BadgeProps> = ({ label, kind = 'new' }) =>
  label ? (
    <span
      className={`text-[11px] leading-none px-2.5 py-[6px] rounded-full font-medium shadow-[var(--shadow-soft)] product-badge ${KIND_CLASS[kind] ?? 'bg-plum text-white'}`}
    >
      {label}
    </span>
  ) : null

export default Badge
