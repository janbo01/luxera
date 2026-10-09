import type { FC, ReactNode } from 'react'
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
  <div
    className={
      className ??
      'flex flex-col items-center justify-center gap-4 py-20 px-[var(--pad)] text-center text-muted'
    }
  >
    <div className="w-20 h-20 rounded-full bg-copper/10 text-copper-dark grid place-items-center">
      <Icon name={icon} size={Math.min(iconSize, 32)} strokeWidth={1.4} />
    </div>
    <h3 className="font-heading text-[22px] font-bold text-ink m-0 mt-1">{title}</h3>
    {body && <p className="text-[14.5px] leading-[1.9] text-muted m-0 max-w-[340px]">{body}</p>}
    {action &&
      (action.to ? (
        <a href={action.to} className={action.ghost ? BTN_GHOST_CLS : BTN_CLS}>
          {action.label}
        </a>
      ) : (
        <button className={action.ghost ? BTN_GHOST_CLS : BTN_CLS} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
  </div>
)

export default EmptyState
