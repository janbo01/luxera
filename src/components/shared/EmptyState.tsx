import type { FC, ReactNode } from 'react'
import { Link } from 'react-router-dom'
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
  className = 'empty-state',
}) => (
  <div className={className}>
    <div className="empty-state__icon">
      <Icon name={icon} size={iconSize} />
    </div>
    <h3 className="empty-state__title">{title}</h3>
    {body && <p className="empty-state__body">{body}</p>}
    {action && (
      action.to ? (
        <Link
          to={action.to}
          className={`btn${action.ghost ? ' btn--ghost' : ''}`}
        >
          {action.label}
        </Link>
      ) : (
        <button
          className={`btn${action.ghost ? ' btn--ghost' : ''}`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )
    )}
  </div>
)

export default EmptyState
