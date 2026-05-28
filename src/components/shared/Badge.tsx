import type { FC } from 'react'

interface BadgeProps {
  label?: string | null
  kind?: string
}

const KIND_CLASS: Record<string, string> = {
  sale:    'bg-sale text-white',
  new:     'bg-plum text-white',
  limited: 'bg-gold text-ink',
}

const Badge: FC<BadgeProps> = ({ label, kind = 'new' }) =>
  label ? (
    <span className={`font-mono text-[10px] tracking-[0.14em] uppercase px-[9px] py-[5px] rounded-[4px] font-medium product-badge ${KIND_CLASS[kind] ?? 'bg-plum text-white'}`}>
      {label}
    </span>
  ) : null

export default Badge
