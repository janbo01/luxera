import type { FC, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BTN_CLS, BTN_GHOST_CLS } from '../ui/Button'
import Icon from '../icons/Icon'

interface EmptyStateAction {
  label: string
  to?: string
  onClick?: () => void
  ghost?: boolean
}

interface EmptyStateProps {
  icon: string
  iconSize?: number
  title: string
  body?: ReactNode
  action?: EmptyStateAction
  className?: string
}


const EmptyState: FC<EmptyStateProps> = ({
  icon,
  iconSize = 40,
  title,
  body,
  action,
  className,
}) => (
  <div className={className ?? 'flex flex-col items-center justify-center gap-4 py-20 px-[var(--pad)] text-center text-muted'}>
    <div className="opacity-35">
      <Icon name={icon} size={iconSize} />
    </div>
    <h3 className="font-heading text-xl font-bold text-ink-2 m-0">{title}</h3>
    {body && <p className="text-sm leading-[1.7] text-muted m-0 max-w-[340px]">{body}</p>}
    {action && (
      action.to ? (
        <Link to={action.to} className={action.ghost ? BTN_GHOST_CLS : BTN_CLS}>{action.label}</Link>
      ) : (
        <button className={action.ghost ? BTN_GHOST_CLS : BTN_CLS} onClick={action.onClick}>{action.label}</button>
      )
    )}
  </div>
)

export default EmptyState
