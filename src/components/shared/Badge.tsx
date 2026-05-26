import type { FC } from 'react'

interface BadgeProps {
  label?: string | null
  kind?: string
}

const Badge: FC<BadgeProps> = ({ label, kind = 'new' }) =>
  label ? <span className={`product__badge product__badge--${kind}`}>{label}</span> : null

export default Badge
